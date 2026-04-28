(function addTeacherPopupModule() {
    function ensureAddPopupRegistry() {
        if (window.addPopupRegistry) return window.addPopupRegistry;
        const registry = {
            providers: {},
            register(mode, provider) {
                if (!mode || !provider) return;
                this.providers[mode] = provider;
            },
            get(mode) {
                return this.providers[mode] || null;
            }
        };
        window.addPopupRegistry = registry;
        return registry;
    }

    function renderAddTeacherPopup() {
        const teacherPopupContainer = document.querySelector('.addteacherpopup');
        if (!teacherPopupContainer) return;

        teacherPopupContainer.innerHTML = `
            <div id="addTeacherHeaderRow" class="add-modal-form-section am-sec is-hidden" aria-hidden="true">
                <div class="add-student-heading-block add-student-heading add-student-redesign-heading">
                    <div class="add-student-redesign-heading-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="8" r="4"></circle>
                            <path d="M4 20c2.4-3.6 5-5.5 8-5.5s5.6 1.9 8 5.5"></path>
                        </svg>
                    </div>
                    <div class="add-student-redesign-heading-copy">
                        <h1 class="add-teacher-title">Add Teacher</h1>
                        <h4 class="add-student-subtitle">Create a teacher profile and credentials.</h4>
                    </div>
                </div>
            </div>
            <div id="addTeacherFields" class="add-modal-form-section am-sec is-hidden" aria-hidden="true">
                <div class="add-student-redesign-fields-card">
                    <div class="add-student-name-row add-student-form-row add-student-form-row--names is-hidden" id="addTeacherNameRow" aria-hidden="true">
                        <label class="add-student-label">
                            <span>First Name</span>
                            <input type="text" id="addTeacherFirst" name="teacherFirstName" autocomplete="off" maxlength="80" placeholder="First name">
                        </label>
                        <label class="add-student-label">
                            <span>Last name</span>
                            <input type="text" id="addTeacherLast" name="teacherLastName" autocomplete="off" maxlength="80" placeholder="Last name">
                        </label>
                    </div>
                    <div id="addTeacherContactRow" class="add-modal-contact-row am-row is-hidden" aria-hidden="true">
                        <label class="add-student-label add-student-contact-email-wrap">
                            <span>Email *</span>
                            <input type="email" id="addTeacherEmail" name="teacherEmail" autocomplete="email" maxlength="120" placeholder="teacher@example.com">
                        </label>
                        <label class="add-student-label add-student-contact-phone-wrap">
                            <span>Phone number *</span>
                            <div class="add-student-phone-row add-student-redesign-phone-row">
                                <div class="add-student-phone-country-wrap" id="addTeacherDialCodeWrap">
                                    <img id="addTeacherPhoneCountryFlag" class="add-student-phone-country-flag" alt="" aria-hidden="true">
                                    <select id="addTeacherPhoneCountry" name="teacherPhoneCountry" aria-label="Country code"></select>
                                </div>
                                <input type="tel" id="addTeacherPhone" name="teacherPhone" autocomplete="tel-national" maxlength="30" placeholder="(__) ____-____">
                            </div>
                        </label>
                    </div>
                </div>
                <div id="addTeacherEmailWrap" class="add-student-account-wrap is-hidden" aria-hidden="true">
                    <div class="email-and-password">
                        <label class="add-student-label" for="addTeacherPassword">
                            <span>Password *</span>
                            <div class="password-input-wrap">
                                <input type="password" id="addTeacherPassword" name="teacherPassword" autocomplete="new-password" minlength="8" maxlength="120" placeholder="At least 8 characters">
                                <button type="button" id="addTeacherPasswordToggle" class="password-toggle-btn" aria-label="Show password" title="Show password" aria-pressed="false">
                                    <span class="password-toggle-btn-icon" aria-hidden="true"></span>
                                </button>
                            </div>
                        </label>
                    </div>
                    <p class="add-student-password-hint">Password must have at least 8 characters.</p>
                </div>
            </div>
        `;
    }

    function openAddTeacherPopup() {
        if (typeof window.requestAddPopupMode === 'function') {
            window.requestAddPopupMode('teacher');
        }
    }

    const registry = ensureAddPopupRegistry();
    registry.register('teacher', {
        mode: 'teacher',
        render: renderAddTeacherPopup
    });
    renderAddTeacherPopup();
    window.renderAddTeacherPopup = renderAddTeacherPopup;
    window.openAddTeacherPopup = openAddTeacherPopup;
})();