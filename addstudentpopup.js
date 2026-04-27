// Add Student Popup
// 1) Render markup
// 2) Keep student-popup-specific helpers below
(function addStudentPopupModule() {
    function renderAddStudentPopup() {
        const studentPopupContainer = document.querySelector('.addstudentpopup');
        if (!studentPopupContainer) return;

        studentPopupContainer.innerHTML = `
            <div id="addStudentHeaderRow" class="add-student-form-section is-hidden" aria-hidden="true">
                <div class="add-student-heading-block add-student-heading add-student-redesign-heading">
                    <div class="add-student-redesign-heading-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="8" r="4"></circle>
                            <path d="M4 20c2.4-3.6 5-5.5 8-5.5s5.6 1.9 8 5.5"></path>
                        </svg>
                    </div>
                    <div class="add-student-redesign-heading-copy">
                        <h1 class="add-student-title">Add Student</h1>
                        <h4 class="add-student-subtitle">Add a new student and set up their account details.</h4>
                    </div>
                </div>
            </div>
            <div id="addStudentFields" class="add-student-form-section is-hidden" aria-hidden="true">
                <div class="add-student-redesign-fields-card">
                    <div class="add-student-name-row add-student-form-row add-student-form-row--names is-hidden" id="addStudentNameRow" aria-hidden="true">
                        <label class="add-student-label">
                            <span>Given name(s) *</span>
                            <input type="text" id="addStudentFirst" name="firstName" autocomplete="off" maxlength="80" placeholder="e.g. Ana Julia or Carolina Mayumi" title="All given names; use spaces inside this field only">
                        </label>
                        <label class="add-student-label">
                            <span>Family name *</span>
                            <input type="text" id="addStudentLast" name="lastName" autocomplete="off" maxlength="80" placeholder="e.g. Silva or Nakadomari">
                        </label>
                    </div>

                    <div id="addStudentContactRow" class="add-student-modal-contact-row is-hidden" aria-hidden="true">
                        <label class="add-student-label add-student-contact-city-wrap" id="addStudentContactCityWrap">
                            <span>City</span>
                            <input type="text" id="addStudentCity" name="city" autocomplete="address-level2" maxlength="120" placeholder="Enter city">
                        </label>
                        <label class="add-student-label add-student-contact-country-wrap" id="addStudentContactCountryWrap">
                            <span>Country</span>
                            <input type="text" id="addStudentCountry" name="country" readonly autocomplete="off" maxlength="120" title="Filled automatically from the phone country code" aria-label="Country (from phone country code)">
                        </label>
                        <label class="add-student-label add-student-contact-phone-wrap" id="addStudentContactPhoneWrap">
                            <span>Phone number</span>
                            <div class="add-student-phone-row add-student-redesign-phone-row">
                                <div class="add-student-phone-country-wrap" id="addStudentContactDialCodeWrap">
                                    <img id="addStudentPhoneCountryFlag" class="add-student-phone-country-flag" alt="" aria-hidden="true">
                                    <select id="addStudentPhoneCountry" name="phoneCountry" aria-label="Country code"></select>
                                </div>
                                <input type="tel" id="addStudentPhone" name="phone" autocomplete="tel-national" maxlength="30" placeholder="(__) ____-____">
                            </div>
                        </label>
                    </div>

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
                </div>

                <section class="add-student-redesign-miro-card">
                    <div class="add-student-redesign-miro-header">
                        <img src="icon/miro.jpeg" class="add-student-redesign-miro-logo" alt="" aria-hidden="true">
                        <div>
                            <h5 class="add-student-redesign-miro-title">Miro Boards (Optional)</h5>
                            <p class="add-student-redesign-miro-subtitle">Add the links to the student's Miro boards.</p>
                        </div>
                    </div>
                    <div class="add-student-redesign-miro-links-row">
                        <div class="add-student-redesign-miro-inline">
                            <label class="add-student-redesign-miro-inline-title" for="addStudentPassportLink">Lessons</label>
                            <label class="add-student-redesign-miro-input-wrap add-student-label add-student-passport-link-wrap" id="addStudentPassportLinkWrap" aria-hidden="true">
                                <input type="url" id="addStudentPassportLink" name="passportLink" autocomplete="url" placeholder="https://miro.com/app/board/...">
                            </label>
                        </div>
                        <div class="add-student-redesign-miro-inline">
                            <label class="add-student-redesign-miro-inline-title" for="addStudentWorkbookBoardLink">Workbook</label>
                            <label class="add-student-redesign-miro-input-wrap add-student-label">
                                <input type="url" id="addStudentWorkbookBoardLink" name="studentWorkbookBoardLink" autocomplete="url" placeholder="https://miro.com/app/board/...">
                            </label>
                        </div>
                    </div>
                </section>

                <div id="addStudentAccountWrap" class="add-student-account-wrap is-hidden" aria-hidden="true">
                    <div class="email-and-password">
                        <label class="add-student-label" for="addStudentEmail">
                            <span>Email</span>
                            <input type="email" id="addStudentEmail" name="studentEmail" autocomplete="email" maxlength="120" placeholder="student@example.com">
                        </label>
                        <label class="add-student-label" for="addStudentUsername">
                            <span>Username</span>
                            <input type="text" id="addStudentUsername" name="studentUsername" readonly autocomplete="username" maxlength="120" placeholder="firstnamelastname_">
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
