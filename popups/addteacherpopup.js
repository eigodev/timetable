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
                <div class="add-teacher-redesign-header">
                    <div class="add-teacher-redesign-header-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="9" cy="8" r="3"></circle>
                            <path d="M3.8 18c1.5-2.4 3.2-3.6 5.2-3.6s3.8 1.2 5.2 3.6"></path>
                            <path d="M17 8.5h4"></path>
                            <path d="M19 6.5v4"></path>
                        </svg>
                    </div>
                    <div class="add-teacher-redesign-header-copy">
                        <h1 class="add-teacher-title">Add Teacher</h1>
                        <h4 class="add-teacher-subtitle">Create a new teacher profile and configure availability.</h4>
                    </div>
                </div>
            </div>
            <div id="addTeacherFields" class="add-modal-form-section am-sec is-hidden" aria-hidden="true">
                <div class="add-teacher-redesign-layout">
                    <div class="add-teacher-redesign-main-col">
                        <section class="add-teacher-card add-teacher-card--basic">
                            <h3 class="add-teacher-card-title">Basic Information</h3>
                            <div id="addTeacherNameRow" class="add-teacher-two-col is-hidden" aria-hidden="true">
                                <label class="add-student-label">
                                    <span>First Name *</span>
                                    <input type="text" id="addTeacherFirst" name="teacherFirstName" autocomplete="off" maxlength="80" placeholder="Enter first name">
                                </label>
                                <label class="add-student-label">
                                    <span>Last Name *</span>
                                    <input type="text" id="addTeacherLast" name="teacherLastName" autocomplete="off" maxlength="80" placeholder="Enter last name">
                                </label>
                            </div>
                            <div id="addTeacherContactRow" class="add-teacher-contact-stack is-hidden" aria-hidden="true">
                                <div class="add-teacher-two-col add-teacher-email-password-row">
                                    <label class="add-student-label add-student-contact-email-wrap">
                                        <span>Email Address *</span>
                                        <input type="email" id="addTeacherEmail" name="teacherEmail" autocomplete="email" maxlength="120" placeholder="Enter email address">
                                    </label>
                                    <label class="add-student-label" for="addTeacherPassword">
                                        <span>Password *</span>
                                        <div class="password-input-wrap password-input-wrap--student-generate">
                                            <input type="text" id="addTeacherPassword" name="teacherPassword" readonly autocomplete="off" spellcheck="false" minlength="8" maxlength="120" placeholder="@xxxNxNN" title="Use the button to generate a password" aria-label="Generated password (read-only)">
                                            <button type="button" id="addTeacherPasswordGenerate" class="btn-add-student-password-generate" aria-label="Generate password" title="Random @CCCNCNN password (8 characters)">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="btn-add-student-password-generate-svg" aria-hidden="true">
                                                    <path fill-rule="evenodd" d="M2.25 6a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V6Zm3.97.97a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 0 1 0-1.06Zm4.28 4.28a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clip-rule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </label>
                                </div>
                                <label class="add-student-label add-student-contact-phone-wrap add-teacher-phone-wrap">
                                    <span>Phone Number</span>
                                    <div class="add-teacher-phone-row">
                                        <div class="add-student-phone-country-wrap" id="addTeacherDialCodeWrap">
                                            <img id="addTeacherPhoneCountryFlag" class="add-student-phone-country-flag" alt="" aria-hidden="true">
                                            <select id="addTeacherPhoneCountry" name="teacherPhoneCountry" aria-label="Country code"></select>
                                        </div>
                                        <input type="tel" id="addTeacherPhone" name="teacherPhone" autocomplete="tel-national" maxlength="30" placeholder="Enter phone number">
                                    </div>
                                </label>
                            </div>
                            <div id="addTeacherEmailWrap" class="add-teacher-password-wrap is-hidden" aria-hidden="true">
                            </div>
                        </section>
                        <section class="add-teacher-card add-teacher-card--professional">
                            <h3 class="add-teacher-card-title">Professional Settings</h3>
                            <div class="add-teacher-two-col">
                                <label class="add-student-label">
                                    <span>Teacher Color Tag</span>
                                    <select>
                                        <option selected>Purple</option>
                                        <option>Blue</option>
                                        <option>Green</option>
                                    </select>
                                </label>
                                <label class="add-student-label">
                                    <span>Time Zone</span>
                                    <select>
                                        <option selected>(GMT-05:00) Eastern Time</option>
                                        <option>(GMT+00:00) UTC</option>
                                    </select>
                                </label>
                            </div>
                            <div>
                                <span class="add-teacher-inline-label">Teaching Type</span>
                                <div class="add-teacher-segmented" role="group" aria-label="Teaching type">
                                    <button type="button" class="add-teacher-segmented-btn">Private Classes</button>
                                    <button type="button" class="add-teacher-segmented-btn">School Classes</button>
                                    <button type="button" class="add-teacher-segmented-btn is-active">Both</button>
                                </div>
                            </div>
                            <div class="add-teacher-two-col">
                                <label class="add-student-label">
                                    <span>Hourly Rate (Optional)</span>
                                    <input type="number" min="0" step="0.01" placeholder="e.g. 50.00">
                                </label>
                                <label class="add-student-label">
                                    <span>Status</span>
                                    <select>
                                        <option selected>Active</option>
                                        <option>Inactive</option>
                                    </select>
                                </label>
                            </div>
                        </section>
                    </div>

                    <div class="add-teacher-redesign-side-col">
                        <section class="add-teacher-card add-teacher-card--availability">
                            <h3 class="add-teacher-card-title">Availability</h3>
                            <table class="add-teacher-availability-table" aria-hidden="true">
                                <thead>
                                    <tr>
                                        <th class="add-teacher-availability-table-day">Day</th>
                                        <th class="add-teacher-availability-table-available">Available</th>
                                        <th class="add-teacher-availability-table-start">Start</th>
                                        <th class="add-teacher-availability-table-end">End</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td class="add-teacher-availability-table-day">Monday</td><td class="add-teacher-checkbox"><input type="checkbox"></td><td>08:00</td><td>18:00</td></tr>
                                    <tr><td class="add-teacher-availability-table-day">Tuesday</td><td class="add-teacher-checkbox"><input type="checkbox"></td><td>08:00</td><td>18:00</td></tr>
                                    <tr><td class="add-teacher-availability-table-day">Wednesday</td><td class="add-teacher-checkbox"><input type="checkbox"></td><td>08:00</td><td>18:00</td></tr>
                                    <tr><td class="add-teacher-availability-table-day">Thursday</td><td class="add-teacher-checkbox"><input type="checkbox"></td><td>08:00</td><td>18:00</td></tr>
                                    <tr><td class="add-teacher-availability-table-day">Friday</td><td class="add-teacher-checkbox"><input type="checkbox"></td><td>08:00</td><td>18:00</td></tr>
                                    <tr><td class="add-teacher-availability-table-day">Saturday</td><td class="add-teacher-checkbox"><input type="checkbox"></td><td>09:00</td><td>17:00</td></tr>
                                    <tr><td class="add-teacher-availability-table-day">Sunday</td><td class="add-teacher-checkbox"><input type="checkbox"></td><td>09:00</td><td>17:00</td></tr>
                                </tbody>
                            </table>
                            <div class="add-teacher-availability-actions">
                                <button type="button" class="add-teacher-ghost-btn">Copy Monday to All</button>
                                <button type="button" class="add-teacher-ghost-btn">Clear All</button>
                                <button type="button" class="add-teacher-ghost-btn">Custom Calendar Setup</button>
                            </div>
                        </section>
                    </div>
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