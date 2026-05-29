(function addStudentModalScript() {
    function parseExternalFollowUpLinkInput(raw) {
        if (typeof window.parseStudentExternalFollowUpLinkInput === 'function') {
            return window.parseStudentExternalFollowUpLinkInput(raw);
        }
        const trimmed = String(raw || '').trim();
        if (!trimmed) {
            return { href: '', error: null };
        }
        let candidate = trimmed;
        if (!/^https?:\/\//i.test(candidate)) {
            candidate = `https://${candidate}`;
        }
        try {
            const u = new URL(candidate);
            if (u.protocol !== 'http:' && u.protocol !== 'https:') {
                return { href: '', error: 'Only http:// and https:// links are allowed.' };
            }
            return { href: u.href, error: null };
        } catch {
            return { href: '', error: 'Please enter a valid link.' };
        }
    }

    const overlay = document.getElementById('studentModalOverlay');
    const modalCard = overlay?.querySelector('.student-modal-card');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const openBtn = document.getElementById('openModalBtn');
    const form = document.getElementById('addStudentModernForm');
    const countryFlagEl = overlay?.querySelector('.country-flag');
    const countryCodeEl = overlay?.querySelector('.country-code');
    const countryDisplayBtn = overlay?.querySelector('.country-display');
    const countryPickerMenu = overlay?.querySelector('#countryPickerMenu');
    const countryPickerOptions = overlay ? [...overlay.querySelectorAll('.country-picker-option')] : [];

    if (!overlay || !modalCard || !form) return;

    const fields = {
        firstName: document.getElementById('firstName'),
        lastName: document.getElementById('lastName'),
        phoneNumber: document.getElementById('phoneNumber'),
        school: document.getElementById('school'),
        birthDate: document.getElementById('birthDate'),
        age: document.getElementById('age'),
        teacher: document.getElementById('studentModalTeacher'),
        level: document.getElementById('level'),
        username: document.getElementById('studentModalUsername'),
        password: document.getElementById('studentModalPassword'),
        externalFollowUpLink: document.getElementById('studentExternalLink')
    };
    const passwordGenerateBtn = document.getElementById('studentModalPasswordGenerate');

    const COUNTRY_PHONE_CONFIG = {
        BR: { iso: 'BR', dialCode: '+55', flagSrc: 'https://flagcdn.com/w40/br.png', country: 'Brazil', placeholder: '(11) 91234-5678' },
        IE: { iso: 'IE', dialCode: '+353', flagSrc: 'https://flagcdn.com/w40/ie.png', country: 'Ireland', placeholder: '85 123 4567' },
        GB: { iso: 'GB', dialCode: '+44', flagSrc: 'https://flagcdn.com/w40/gb.png', country: 'United Kingdom', placeholder: '7400 123456' },
        US: { iso: 'US', dialCode: '+1', flagSrc: 'https://flagcdn.com/w40/us.png', country: 'United States', placeholder: '(201) 555-0123' },
        CA: { iso: 'CA', dialCode: '+1', flagSrc: 'https://flagcdn.com/w40/ca.png', country: 'Canada', placeholder: '(416) 555-0123' }
    };
    const COUNTRY_CODE_ORDER = ['+353', '+55', '+44', '+1'];
    const COUNTRY_CODE_TO_ISO = { '+353': 'IE', '+55': 'BR', '+44': 'GB', '+1': 'US' };
    let selectedCountryIso = 'BR';

    function getStoredRoster() {
        try {
            const roster = JSON.parse(localStorage.getItem('timetable_roster') || 'null');
            return roster && typeof roster === 'object' && !Array.isArray(roster) ? roster : null;
        } catch {
            return null;
        }
    }

    function getAvailableSchoolNamesFromRosterPayload(roster) {
        const schools = new Set();
        const studentSchools = roster?.studentSchools && typeof roster.studentSchools === 'object'
            ? roster.studentSchools
            : {};
        Object.values(studentSchools).forEach((school) => {
            const name = String(school || '').trim();
            if (name) schools.add(name);
        });
        if (Array.isArray(roster?.customSchools)) {
            roster.customSchools.forEach((school) => {
                const name = String(school || '').trim();
                if (name) schools.add(name);
            });
        }
        return [...schools].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    }

    function getSchoolNamesForStudentSchoolPicker() {
        if (typeof window.getSchoolNamesForStudentSchoolSelect === 'function') {
            return window.getSchoolNamesForStudentSchoolSelect();
        }
        const roster = getStoredRoster();
        return getAvailableSchoolNamesFromRosterPayload(roster);
    }

    function refreshSchoolOptions(selectedSchool = '') {
        if (!(fields.school instanceof HTMLSelectElement)) return;
        const selected = String(selectedSchool || fields.school.value || '').trim();
        const schools = getSchoolNamesForStudentSchoolPicker();
        fields.school.innerHTML = '<option value="" disabled selected>Select a school</option>';
        schools.forEach((school) => {
            const option = document.createElement('option');
            option.value = school;
            option.textContent = school;
            fields.school.appendChild(option);
        });
        if (selected && schools.includes(selected)) {
            fields.school.value = selected;
        }
    }

    const STUDENT_MODAL_CLOSE_ANIMATION_MS = 220;
    let studentModalCloseTimer = null;

    function openModal() {
        if (window.TimeTablePermissions && !window.TimeTablePermissions.canManageRoster?.()) {
            console.warn('Permission denied: students cannot add student profiles.');
            return;
        }
        const legacyAddModal = document.getElementById('addModal');
        if (legacyAddModal?.classList.contains('is-open')) {
            legacyAddModal.classList.remove('is-open', 'is-closing');
            legacyAddModal.setAttribute('aria-hidden', 'true');
        }
        if (studentModalCloseTimer) {
            clearTimeout(studentModalCloseTimer);
            studentModalCloseTimer = null;
        }
        refreshSchoolOptions();
        if (typeof window.refreshModernStudentTeacherSelect === 'function') {
            window.refreshModernStudentTeacherSelect();
        }
        overlay.classList.remove('is-closing');
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        setSelectedCountry('BR');
        fields.firstName?.focus();
    }

    function closeModal() {
        if (overlay.classList.contains('is-closing')) return;
        if (!overlay.classList.contains('is-open')) return;
        closeCountryPicker();
        if (studentModalCloseTimer) {
            clearTimeout(studentModalCloseTimer);
            studentModalCloseTimer = null;
        }
        overlay.classList.remove('is-open');
        overlay.classList.add('is-closing');
        overlay.setAttribute('aria-hidden', 'true');
        studentModalCloseTimer = window.setTimeout(() => {
            overlay.classList.remove('is-closing');
            studentModalCloseTimer = null;
        }, STUDENT_MODAL_CLOSE_ANIMATION_MS);
    }

    function clearAllErrors() {
        Object.values(fields).forEach((field) => {
            if (field instanceof HTMLElement) field.removeAttribute('aria-invalid');
        });
    }

    function formatBrazilPhone(rawValue) {
        const digits = String(rawValue || '').replace(/\D/g, '').slice(0, 11);
        if (!digits) return '';
        if (digits.length <= 2) return `(${digits}`;
        if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        if (digits.length <= 10) {
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
        }
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }

    function formatUsLikePhone(rawDigits) {
        const digits = String(rawDigits || '').replace(/\D/g, '').slice(0, 10);
        if (!digits) return '';
        if (digits.length <= 3) return `(${digits}`;
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    function formatUkPhone(rawDigits) {
        const digits = String(rawDigits || '').replace(/\D/g, '').slice(0, 10);
        if (!digits) return '';
        if (digits.length <= 4) return digits;
        return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }

    function formatIrelandPhone(rawDigits) {
        let digits = String(rawDigits || '').replace(/\D/g, '');
        if (digits.length === 10 && digits.startsWith('0')) {
            digits = digits.slice(1);
        }
        digits = digits.slice(0, 9);
        if (!digits) return '';
        if (digits.length <= 2) return digits;
        if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
        return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    }

    /**
     * National/local digit count **after** any +country stripping (matches validators and format caps).
     * IE: mobiles are 9 NSN digits (e.g. 89 xxx xxxx); many geographic lines are 8 after +353.
     */
    function isPlausibleNationalPhoneDigits(iso, digitCount) {
        if (!digitCount) return false;
        if (iso === 'IE') return digitCount >= 8 && digitCount <= 9;
        if (iso === 'GB') return digitCount >= 9 && digitCount <= 10;
        if (iso === 'BR') return digitCount >= 10 && digitCount <= 11;
        if (iso === 'US' || iso === 'CA') return digitCount === 10;
        return digitCount >= 8 && digitCount <= 15;
    }

    function setSelectedCountry(iso) {
        const nextIso = COUNTRY_PHONE_CONFIG[iso] ? iso : 'BR';
        selectedCountryIso = nextIso;
        const cfg = COUNTRY_PHONE_CONFIG[nextIso];
        if (countryCodeEl) countryCodeEl.textContent = cfg.dialCode;
        if (countryFlagEl instanceof HTMLImageElement) {
            countryFlagEl.src = cfg.flagSrc;
            countryFlagEl.alt = `${cfg.country} flag`;
        }
        if (fields.phoneNumber) fields.phoneNumber.placeholder = cfg.placeholder;
    }

    function openCountryPicker() {
        if (!countryPickerMenu) return;
        countryPickerMenu.hidden = false;
        countryDisplayBtn?.setAttribute('aria-expanded', 'true');
    }

    function closeCountryPicker() {
        if (!countryPickerMenu) return;
        countryPickerMenu.hidden = true;
        countryDisplayBtn?.setAttribute('aria-expanded', 'false');
    }

    function toggleCountryPicker() {
        if (!countryPickerMenu) return;
        if (countryPickerMenu.hidden) {
            openCountryPicker();
        } else {
            closeCountryPicker();
        }
    }

    function detectCountryCodeAndStrip(rawValue) {
        const value = String(rawValue || '').trim();
        if (!value) return { detectedIso: null, localDigits: '' };

        const normalized = value.startsWith('00') ? `+${value.slice(2)}` : value;
        const startsWithCode = normalized.startsWith('+');
        const digits = normalized.replace(/\D/g, '');

        if (!startsWithCode) {
            return { detectedIso: null, localDigits: digits };
        }

        for (const code of COUNTRY_CODE_ORDER) {
            const codeDigits = code.replace('+', '');
            if (!digits.startsWith(codeDigits)) continue;
            let detectedIso = COUNTRY_CODE_TO_ISO[code] || null;
            if (code === '+1' && (selectedCountryIso === 'US' || selectedCountryIso === 'CA')) {
                detectedIso = selectedCountryIso;
            }
            const localDigits = digits.slice(codeDigits.length);
            return { detectedIso, localDigits };
        }

        return { detectedIso: null, localDigits: digits };
    }

    function formatLocalPhoneForSelectedCountry(rawDigits) {
        if (selectedCountryIso === 'BR') return formatBrazilPhone(rawDigits);
        if (selectedCountryIso === 'GB') return formatUkPhone(rawDigits);
        if (selectedCountryIso === 'IE') return formatIrelandPhone(rawDigits);
        return formatUsLikePhone(rawDigits);
    }

    function calculateAgeFromBirthDate(value) {
        if (!value) return '';
        const birth = new Date(value);
        if (Number.isNaN(birth.getTime())) return '';
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        const dayDiff = today.getDate() - birth.getDate();
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age -= 1;
        }
        if (age < 0) return '';
        return age > 60 ? '60+' : String(age);
    }

    function syncAgeFromBirthDate() {
        if (!fields.age) return;
        fields.age.value = calculateAgeFromBirthDate(fields.birthDate?.value || '');
    }

    function buildUsername(firstName, lastName) {
        if (typeof buildDefaultStudentUsername === 'function') {
            return buildDefaultStudentUsername(firstName, lastName);
        }
        if (typeof TimeTableAuthMigrate !== 'undefined' && TimeTableAuthMigrate.buildCanonicalUsernameBaseFromFullName) {
            const parts = [firstName, lastName].map((s) => String(s || '').trim()).filter(Boolean);
            return TimeTableAuthMigrate.buildCanonicalUsernameBaseFromFullName(parts.join(' '));
        }
        const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const first = normalize(firstName);
        const last = normalize(lastName);
        if (!first && !last) return '';
        return `${first}${last}_`;
    }

    function randomLowercase() {
        return String.fromCharCode(97 + Math.floor(Math.random() * 26));
    }

    function randomDigit() {
        return String(Math.floor(Math.random() * 10));
    }

    function generateStudentPassword() {
        return `@${randomLowercase()}${randomLowercase()}${randomLowercase()}${randomDigit()}${randomLowercase()}${randomDigit()}${randomDigit()}`;
    }

    function syncUsernameFromNameFields() {
        if (!fields.username) return;
        fields.username.value = buildUsername(fields.firstName.value, fields.lastName.value);
    }

    function validateForm() {
        clearAllErrors();

        const firstName = fields.firstName.value.trim();
        const lastName = fields.lastName.value.trim();
        const phoneDigits = fields.phoneNumber.value.replace(/\D/g, '');
        const school = fields.school.value.trim();
        const ageRaw = fields.age.value.trim();
        const numericAge = ageRaw === '60+' ? 61 : Number(ageRaw);
        const level = fields.level.value;

        let hasError = false;
        const validationErrors = [];

        if (!firstName) {
            fields.firstName.setAttribute('aria-invalid', 'true');
            validationErrors.push('First name is required.');
            hasError = true;
        }

        if (!lastName) {
            fields.lastName.setAttribute('aria-invalid', 'true');
            validationErrors.push('Last name is required.');
            hasError = true;
        }

        if (phoneDigits && !isPlausibleNationalPhoneDigits(selectedCountryIso, phoneDigits.length)) {
            fields.phoneNumber.setAttribute('aria-invalid', 'true');
            validationErrors.push('Enter a valid phone number.');
            hasError = true;
        }

        if (fields.birthDate?.value) {
            if (!Number.isFinite(numericAge) || numericAge < 18) {
                fields.birthDate.setAttribute('aria-invalid', 'true');
                validationErrors.push('Student age must be 18 or older.');
                hasError = true;
            }
        }

        if (!school) {
            fields.school.setAttribute('aria-invalid', 'true');
            validationErrors.push("School's name is required.");
            hasError = true;
        }

        if (!level) {
            fields.level.setAttribute('aria-invalid', 'true');
            validationErrors.push('Level is required.');
            hasError = true;
        }

        if (fields.teacher instanceof HTMLSelectElement) {
            if (!String(fields.teacher.value || '').trim()) {
                fields.teacher.setAttribute('aria-invalid', 'true');
                const msg = fields.teacher.disabled ? 'Add a teacher profile before creating students.' : 'Please select a teacher.';
                validationErrors.push(msg);
                hasError = true;
            }
        }

        if (validationErrors.length > 0) {
            alert(validationErrors[0]);
        }

        return !hasError;
    }

    function getStudentPayload() {
        const phoneCfg = COUNTRY_PHONE_CONFIG[selectedCountryIso] || COUNTRY_PHONE_CONFIG.BR;
        return {
            firstName: fields.firstName.value.trim(),
            lastName: fields.lastName.value.trim(),
            phoneCountry: {
                country: phoneCfg.country,
                flag: phoneCfg.iso,
                dialCode: phoneCfg.dialCode
            },
            phoneNumber: fields.phoneNumber.value.trim(),
            school: fields.school.value.trim(),
            birthDate: fields.birthDate?.value || '',
            age: fields.age.value,
            mentorTeacher: fields.teacher instanceof HTMLSelectElement ? fields.teacher.value.trim() : '',
            level: fields.level.value,
            username: fields.username.value.trim(),
            password: fields.password.value.trim()
        };
    }

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeModal();
        }
    });

    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    openBtn?.addEventListener('click', openModal);
    window.openNewAddStudentModal = openModal;
    window.closeNewAddStudentModal = closeModal;

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        if (countryPickerMenu && !countryPickerMenu.hidden) {
            closeCountryPicker();
            return;
        }
        if (!overlay.classList.contains('is-open')) return;
        closeModal();
    });

    countryDisplayBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        toggleCountryPicker();
    });

    countryPickerOptions.forEach((option) => {
        option.addEventListener('click', () => {
            const iso = String(option.getAttribute('data-country-iso') || '').trim().toUpperCase();
            if (!COUNTRY_PHONE_CONFIG[iso]) return;
            setSelectedCountry(iso);
            const localDigits = fields.phoneNumber.value.replace(/\D/g, '');
            fields.phoneNumber.value = formatLocalPhoneForSelectedCountry(localDigits);
            closeCountryPicker();
            fields.phoneNumber.focus();
        });
    });

    fields.phoneNumber.addEventListener('input', (event) => {
        const { detectedIso, localDigits } = detectCountryCodeAndStrip(event.target.value);
        if (detectedIso) {
            setSelectedCountry(detectedIso);
        }
        const formatted = formatLocalPhoneForSelectedCountry(localDigits);
        event.target.value = formatted;
        fields.phoneNumber.removeAttribute('aria-invalid');
    });

    passwordGenerateBtn?.addEventListener('click', () => {
        if (!fields.password) return;
        fields.password.value = generateStudentPassword();
    });

    document.addEventListener('click', (event) => {
        if (!overlay.classList.contains('is-open')) return;
        if (!countryPickerMenu || countryPickerMenu.hidden) return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.closest('.country-display') || target.closest('.country-picker-menu')) return;
        closeCountryPicker();
    });

    fields.school.addEventListener('change', () => fields.school.removeAttribute('aria-invalid'));
    fields.firstName.addEventListener('input', () => {
        fields.firstName.removeAttribute('aria-invalid');
        syncUsernameFromNameFields();
    });
    fields.lastName.addEventListener('input', () => {
        fields.lastName.removeAttribute('aria-invalid');
        syncUsernameFromNameFields();
    });
    fields.level.addEventListener('change', () => fields.level.removeAttribute('aria-invalid'));
    fields.teacher?.addEventListener('change', () => fields.teacher?.removeAttribute('aria-invalid'));
    fields.birthDate?.addEventListener('input', syncAgeFromBirthDate);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!validateForm()) return;

        if (fields.password && !fields.password.value.trim()) {
            fields.password.value = generateStudentPassword();
        }
        syncUsernameFromNameFields();
        syncAgeFromBirthDate();

        const linkRaw = fields.externalFollowUpLink instanceof HTMLInputElement ? fields.externalFollowUpLink.value : '';
        const linkParsed = parseExternalFollowUpLinkInput(linkRaw);
        if (linkParsed.error) {
            alert(linkParsed.error);
            fields.externalFollowUpLink?.focus();
            return;
        }

        const studentData = getStudentPayload();
        studentData.externalFollowUpLink = linkParsed.href;
        if (typeof window.createStudentFromModernModal !== 'function') {
            const msg =
                'Could not save this student because the save handler failed to load. Try refreshing the page.';
            if (typeof window.showAppMessage === 'function') window.showAppMessage(msg);
            else alert(msg);
            return;
        }
        try {
            const saved = await window.createStudentFromModernModal(studentData);
            if (!saved) return;
        } catch (err) {
            console.error(err);
            const msg = 'Something went wrong while saving the student. Please try again.';
            if (typeof window.showAppMessage === 'function') window.showAppMessage(msg);
            else alert(msg);
            return;
        }

        closeModal();
    });

    syncUsernameFromNameFields();
    syncAgeFromBirthDate();
    setSelectedCountry('BR');
    refreshSchoolOptions();
})();
