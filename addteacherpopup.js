// Add Teacher Popup
// 1) Render markup
// 2) Keep teacher-popup-specific helpers below
(function addTeacherPopupModule() {
    function renderAddTeacherPopup() {
        const teacherPopupContainer = document.querySelector('.addteacherpopup');
        if (!teacherPopupContainer) return;

        teacherPopupContainer.innerHTML = `
            <div id="addTeacherFields" class="add-teacher-form-section is-hidden" aria-hidden="true">
                <div id="addTeacherBasicInfoSection" class="add-teacher-basic-info-section is-hidden" aria-hidden="true">
                    <div class="add-teacher-heading-block add-teacher-heading">
                        <h1 class="add-teacher-title">Add Teacher</h1>
                        <h4 class="add-teacher-subtitle">Add a new teacher to your school or create your own profile.</h4>
                    </div>
                    <h3 class="add-teacher-section-title">1. Basic Information</h3>
                </div>
                <div class="add-teacher-name-row is-hidden" id="addTeacherNameRow" aria-hidden="true">
                    <label class="add-teacher-label">
                        <span>First Name</span>
                        <input type="text" id="addTeacherFirst" name="teacherFirstName" autocomplete="given-name" maxlength="80">
                    </label>
                    <label class="add-teacher-label">
                        <span>Last Name</span>
                        <input type="text" id="addTeacherLast" name="teacherLastName" autocomplete="family-name" maxlength="80">
                    </label>
                </div>
                <div id="addTeacherContactRow" class="add-teacher-contact-row is-hidden is-teacher-layout" aria-hidden="true">
                    <label class="add-teacher-label add-teacher-contact-email-wrap" id="addTeacherContactEmailWrap">
                        <span>Email address</span>
                        <input type="email" id="addTeacherEmail" name="email" autocomplete="email" maxlength="120" placeholder="youremail@example.com">
                    </label>
                    <label class="add-teacher-label add-teacher-contact-phone-wrap" id="addTeacherContactPhoneWrap">
                        <span>Phone number</span>
                        <div class="add-teacher-phone-row">
                            <div class="add-teacher-phone-country-wrap" id="addTeacherDialCodeWrap">
                                <img id="addTeacherPhoneCountryFlag" class="add-teacher-phone-country-flag" alt="" aria-hidden="true">
                                <select id="addTeacherPhoneCountry" name="teacherPhoneCountry" aria-label="Country code"></select>
                            </div>
                            <input type="tel" id="addTeacherPhone" name="teacherPhone" autocomplete="tel-national" maxlength="30" placeholder="(__) ____-____">
                        </div>
                    </label>
                </div>
            </div>
            <div class="add-teacher-email-wrap is-hidden" id="addTeacherEmailWrap" aria-hidden="true">
                <div class="email-and-password">
                    <label class="add-teacher-label" for="addTeacherPassword">
                        <span>Password</span>
                        <div class="password-input-wrap">
                            <input type="password" id="addTeacherPassword" name="password" autocomplete="new-password" minlength="8" maxlength="120" placeholder="Enter your password">
                            <button type="button" id="addTeacherPasswordToggle" class="password-toggle-btn" aria-label="Show password" title="Show password" aria-pressed="false">
                                <span class="password-toggle-btn-icon" aria-hidden="true"></span>
                            </button>
                        </div>
                    </label>
                </div>
                <p class="add-teacher-email-hint">Password must have at least 8 characters.</p>
            </div>
        `;
    }

    function openAddTeacherPopup() {
        if (typeof window.requestAddPopupMode === 'function') {
            window.requestAddPopupMode('teacher');
        }
    }

    // Teacher-popup logic section
    renderAddTeacherPopup();
    window.renderAddTeacherPopup = renderAddTeacherPopup;
    window.openAddTeacherPopup = openAddTeacherPopup;
})();
