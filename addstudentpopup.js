// Add Student Popup
// 1) Render markup
// 2) Keep student-popup-specific helpers below
(function addStudentPopupModule() {
    function renderAddStudentPopup() {
        const studentPopupContainer = document.querySelector('.addstudentpopup');
        if (!studentPopupContainer) return;

        studentPopupContainer.innerHTML = `
            <div id="addStudentHeaderRow" class="add-student-form-section is-hidden" aria-hidden="true">
                <div class="add-student-heading-block add-student-heading">
                    <h1 class="add-student-title">Add Student</h1>
                    <h4 class="add-student-subtitle">Add a new student and set up their account details.</h4>
                </div>
            </div>
            <div class="add-student-name-row add-student-form-row add-student-form-row--names is-hidden" id="addStudentNameRow" aria-hidden="true">
                <label class="add-student-label">
                    <span>First Name</span>
                    <input type="text" id="addStudentFirst" name="firstName" autocomplete="given-name" maxlength="80">
                </label>
                <label class="add-student-label">
                    <span>Last Name</span>
                    <input type="text" id="addStudentLast" name="lastName" autocomplete="family-name" maxlength="80">
                </label>
            </div>
            <div id="addStudentContactRow" class="add-student-modal-contact-row is-hidden" aria-hidden="true">
                <label class="add-student-label add-student-contact-city-wrap" id="addStudentContactCityWrap">
                    <span>City</span>
                    <input type="text" id="addStudentCity" name="city" autocomplete="address-level2" maxlength="120">
                </label>
                <label class="add-student-label add-student-contact-country-wrap" id="addStudentContactCountryWrap">
                    <span>Country</span>
                    <input type="text" id="addStudentCountry" name="country" readonly autocomplete="off" maxlength="120" title="Filled automatically from the phone country code" aria-label="Country (from phone country code)">
                </label>
                <label class="add-student-label add-student-contact-phone-wrap" id="addStudentContactPhoneWrap">
                    <span>Phone number</span>
                    <div class="add-student-phone-row">
                        <div class="add-student-phone-country-wrap" id="addStudentContactDialCodeWrap">
                            <img id="addStudentPhoneCountryFlag" class="add-student-phone-country-flag" alt="" aria-hidden="true">
                            <select id="addStudentPhoneCountry" name="phoneCountry" aria-label="Country code"></select>
                        </div>
                        <input type="tel" id="addStudentPhone" name="phone" autocomplete="tel-national" maxlength="30" placeholder="(__) ____-____">
                    </div>
                </label>
            </div>
            <div id="addStudentFields" class="add-student-form-section is-hidden" aria-hidden="true">
                <div id="addStudentPlacementRow" class="add-student-placement-row">
                    <div id="addStudentGroupWrap" class="add-student-group-wrap-cell" aria-hidden="true">
                        <label class="add-student-label add-student-group-field-label" for="addStudentGroupSelect">
                            <span>School's Name</span>
                            <select id="addStudentGroupSelect" name="schoolSelect" class="is-hidden" aria-hidden="true">
                                <option value="" disabled selected hidden>Select a school</option>
                            </select>
                        </label>
                    </div>
                    <div id="addStudentMentorRow" class="add-student-row-mentor-theme is-hidden" aria-hidden="true">
                        <div class="add-student-mentor-wrap is-hidden" id="addStudentMentorWrap" aria-hidden="true">
                            <label class="add-student-label" for="addStudentMentor">
                                <span>Teacher</span>
                                <select id="addStudentMentor" name="teacher" aria-label="Teacher"></select>
                            </label>
                        </div>
                    </div>
                </div>
                <div id="addStudentAccountWrap" class="add-student-account-wrap is-hidden" aria-hidden="true">
                    <div class="email-and-password">
                        <label class="add-student-label" for="addStudentEmail">
                            <span>Email</span>
                            <input type="email" id="addStudentEmail" name="studentEmail" autocomplete="email" maxlength="120" placeholder="student@example.com">
                        </label>
                        <label class="add-student-label" for="addStudentPassword">
                            <span>Password</span>
                            <div class="password-input-wrap password-input-wrap--student-generate">
                                <input type="text" id="addStudentPassword" name="studentPassword" readonly autocomplete="off" spellcheck="false" minlength="8" maxlength="120" placeholder="@xxxNxNN" title="Use the button to generate a password" aria-label="Generated password (read-only)">
                                <button type="button" id="addStudentPasswordGenerate" class="btn-add-student-password-generate" aria-label="Generate password" title="Random @CCCNCNN password (8 characters)">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="btn-add-student-password-generate-svg" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M2.25 6a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V6Zm3.97.97a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 0 1 0-1.06Zm4.28 4.28a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </label>
                    </div>
                    <p class="add-student-password-hint">Click on the button to generate a random password.</p>
                </div>
                <label class="add-student-label add-student-passport-link-wrap" id="addStudentPassportLinkWrap" aria-hidden="true">
                    <span>Follow-up spreadsheet link</span>
                    <input type="url" id="addStudentPassportLink" name="passportLink" autocomplete="url" placeholder="https://...">
                </label>
            </div>
        `;
    }

    function openAddStudentPopup() {
        if (typeof window.requestAddPopupMode === 'function') {
            window.requestAddPopupMode('student-global');
        }
    }

    // Student-popup logic section
    renderAddStudentPopup();
    window.renderAddStudentPopup = renderAddStudentPopup;
    window.openAddStudentPopup = openAddStudentPopup;
})();
