// Add School Popup
// 1) Render markup
// 2) Keep school-popup-specific helpers below
(function addSchoolPopupModule() {
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

    function renderAddSchoolPopup() {
        const schoolPopupContainer = document.querySelector('.addschoolpopup');
        if (!schoolPopupContainer) return;

        schoolPopupContainer.innerHTML = `
            <div id="addSchoolFields" class="add-school-form-section am-sec is-hidden" aria-hidden="true">
                <div class="add-school-heading">
                    <h1 class="add-school-title">Add School</h1>
                    <h4 class="add-school-subtitle">Add a new school and how classes and payments work.</h4>
                </div>

                <div class="add-school-primary-row">
                    <label class="add-school-label add-school-name-wrap" id="addSchoolNameWrap" aria-hidden="true" for="addSchoolNameInput">
                        <span>School's Name *</span>
                        <input type="text" id="addSchoolNameInput" name="school" autocomplete="organization" maxlength="120" placeholder="e.g. HomeTeachers">
                    </label>

                    <div id="addSchoolThemeWrap" class="add-school-theme-wrap">
                        <p class="add-school-theme-title">Color Theme</p>
                        <div class="add-school-theme-column">
                            <div class="add-school-theme-row">
                                <div class="add-school-theme-control-row">
                                    <input type="hidden" id="addSchoolPrimaryColor" name="schoolPrimaryColor" value="#5c6bc0">
                                    <button type="button" class="school-settings-theme-square add-school-theme-square--primary" aria-label="Pick primary class color"></button>
                                    <input type="text" id="addSchoolPrimaryColorCode" class="add-school-color-code" value="#5C6BC0" readonly aria-label="Primary class color hex">
                                </div>
                            </div>
                            <div class="add-school-theme-row">
                                <div class="add-school-theme-control-row">
                                    <input type="hidden" id="addSchoolSecondaryColor" name="schoolSecondaryColor" value="#1e88e5">
                                    <button type="button" class="school-settings-theme-square add-school-theme-square--secondary" aria-label="Pick primary extra/reposition color"></button>
                                    <input type="text" id="addSchoolSecondaryColorCode" class="add-school-color-code" value="#1E88E5" readonly aria-label="Primary extra/reposition color hex">
                                </div>
                            </div>
                        </div>
                        <div id="addSchoolColorPopup" class="school-settings-color-popup" hidden aria-hidden="true" role="dialog" aria-label="Choose color">
                            <div id="addSchoolColorPopupOptions" class="school-settings-color-popup-options"></div>
                        </div>
                    </div>
                </div>

                <label class="add-school-label add-school-billing-wrap" for="addSchoolBillingModel">
                    <span>Billing Model*</span>
                    <small class="add-school-billing-guideline">Choose how this school is billed.</small>
                    <input type="hidden" id="addSchoolBillingModel" name="schoolBillingModel" value="">
                    <div id="addSchoolBillingLayout" class="add-school-billing-layout">
                    <div id="addSchoolBillingOptions" class="add-school-billing-options" role="radiogroup" aria-label="Billing model options">
                        <button type="button" class="add-school-billing-option" role="radio" aria-checked="false" data-billing-model="perClass">
                            <span class="add-school-billing-option-title">
                                <svg class="add-school-billing-option-icon" xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 32 32" aria-hidden="true">
                                    <path fill="#2DB878" d="M15.8 2.6a1.7 1.7 0 0 1 2.4 0l11.2 11.2a1.7 1.7 0 0 1 0 2.4L18.2 27.4a1.7 1.7 0 0 1-2.4 0L4.6 16.2a1.7 1.7 0 0 1 0-2.4L15.8 2.6Z"/>
                                    <path fill="#1C9B63" d="m10.5 9.2l12.3 12.3l-2.1 2.1L8.4 11.3z"/>
                                    <circle cx="17.1" cy="11" r="2.7" fill="#0B7E4A"/>
                                    <path fill="#F7F7F7" d="M13.3 18.6c.2-.5.6-.9 1.2-1.1l-.7-.7a.5.5 0 1 1 .7-.7l.7.7c.7-.4 1.5-.3 2 .1c.3.2.3.6.1.9c-.2.3-.6.3-.9.1c-.3-.2-.7-.1-1 .2c-.4.4-.1.9.3 1.1c.4.2.9.2 1.3.5c.8.5 1 1.5.6 2.3l.6.6a.5.5 0 0 1-.7.7l-.6-.6c-.8.5-1.9.5-2.7-.2a.6.6 0 0 1-.1-.9c.2-.3.6-.3.9-.1c.5.4 1 .4 1.4 0c.4-.4.2-.9-.3-1.2c-.4-.2-.8-.2-1.2-.4c-.9-.5-1.2-1.5-.9-2.3Z"/>
                                </svg>
                                <span>Per class</span>
                            </span>
                            <span class="add-school-billing-option-desc">You are paid for each class you teach.</span>
                        </button>
                        <button type="button" class="add-school-billing-option" role="radio" aria-checked="false" data-billing-model="monthly">
                            <span class="add-school-billing-option-title">
                                <svg class="add-school-billing-option-icon" xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 128 128" aria-hidden="true">
                                    <path fill="#FFCA28" d="M93.46 39.45c6.71-1.49 15.45-8.15 16.78-11.43c.78-1.92-3.11-4.92-4.15-6.13c-2.38-2.76-1.42-4.12-.5-7.41c1.05-3.74-1.44-7.87-4.97-9.49s-7.75-1.11-11.3.47s-6.58 4.12-9.55 6.62c-2.17-1.37-5.63-7.42-11.23-3.49c-3.87 2.71-4.22 8.61-3.72 13.32c1.17 10.87 3.85 16.51 8.9 18.03c6.38 1.92 13.44.91 19.74-.49z"/>
                                    <path fill="#E2A610" d="M104.36 8.18c-.85 14.65-15.14 24.37-21.92 28.65l4.4 3.78s2.79.06 6.61-1.16c6.55-2.08 16.12-7.96 16.78-11.43c.97-5.05-4.21-3.95-5.38-7.94c-.61-2.11 2.97-6.1-.49-11.9zm-24.58 3.91s-2.55-2.61-4.44-3.8c-.94 1.77-1.61 3.69-1.94 5.67c-.59 3.48 0 8.42 1.39 12.1c.22.57 1.04.48 1.13-.12c1.2-7.91 3.86-13.85 3.86-13.85z"/>
                                    <path fill="#FFCA28" d="M61.96 38.16S30.77 41.53 16.7 68.61s-2.11 43.5 10.55 49.48c12.66 5.98 44.56 8.09 65.31 3.17s25.94-15.12 24.97-24.97c-1.41-14.38-14.77-23.22-14.77-23.22s.53-17.76-13.25-29.29c-12.23-10.24-27.55-5.62-27.55-5.62z"/>
                                    <path fill="#6B4B46" d="M74.76 83.73c-6.69-8.44-14.59-9.57-17.12-12.6c-1.38-1.65-2.19-3.32-1.88-5.39c.33-2.2 2.88-3.72 4.86-4.09c2.31-.44 7.82-.21 12.45 4.2c1.1 1.04.7 2.66.67 4.11c-.08 3.11 4.37 6.13 7.97 3.53c3.61-2.61.84-8.42-1.49-11.24c-1.76-2.13-8.14-6.82-16.07-7.56c-2.23-.21-11.2-1.54-16.38 8.31c-1.49 2.83-2.04 9.67 5.76 15.45c1.63 1.21 10.09 5.51 12.44 8.3c4.07 4.83 1.28 9.08-1.9 9.64c-8.67 1.52-13.58-3.17-14.49-5.74c-.65-1.83.03-3.81-.81-5.53c-.86-1.77-2.62-2.47-4.48-1.88c-6.1 1.94-4.16 8.61-1.46 12.28c2.89 3.93 6.44 6.3 10.43 7.6c14.89 4.85 22.05-2.81 23.3-8.42c.92-4.11.82-7.67-1.8-10.97z"/>
                                    <path fill="none" stroke="#6B4B46" stroke-miterlimit="10" stroke-width="5" d="M71.16 48.99c-12.67 27.06-14.85 61.23-14.85 61.23"/>
                                    <path fill="#6D4C41" d="M81.67 31.96c8.44 2.75 10.31 10.38 9.7 12.46c-.73 2.44-10.08-7.06-23.98-6.49c-4.86.2-3.45-2.78-1.2-4.5c2.97-2.27 7.96-3.91 15.48-1.47z"/>
                                    <path fill="#6B4B46" d="M81.67 31.96c8.44 2.75 10.31 10.38 9.7 12.46c-.73 2.44-10.08-7.06-23.98-6.49c-4.86.2-3.45-2.78-1.2-4.5c2.97-2.27 7.96-3.91 15.48-1.47z"/>
                                    <path fill="#E2A610" d="M96.49 58.86c1.06-.73 4.62.53 5.62 7.5c.49 3.41.64 6.71.64 6.71s-4.2-3.77-5.59-6.42c-1.75-3.35-2.43-6.59-.67-7.79z"/>
                                </svg>
                                <span>Monthly</span>
                            </span>
                            <span class="add-school-billing-option-desc">You receive a fixed monthly fee per student.</span>
                        </button>
                        <button type="button" class="add-school-billing-option" role="radio" aria-checked="false" data-billing-model="package">
                            <span class="add-school-billing-option-title">
                                <svg class="add-school-billing-option-icon" xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100" aria-hidden="true">
                                    <path fill="#FBF063" fill-rule="evenodd" d="M7 22L50 0l43 22l-43 21.001L7 22z" clip-rule="evenodd"/>
                                    <path fill="#F29C1F" fill-rule="evenodd" d="M50.003 42.997L7 22v54.28l43.006 21.714l-.003-54.997z" clip-rule="evenodd"/>
                                    <path fill="#F0C419" fill-rule="evenodd" d="M50 97.994L93.006 76.28V22L50.003 42.997L50 97.994z" clip-rule="evenodd"/>
                                    <path fill="#F29C1F" fill-rule="evenodd" d="m27.036 11.705l42.995 21.498l2.263-1.105l-43.047-21.524z" clip-rule="evenodd" opacity=".5"/>
                                    <path fill="#fff" fill-rule="evenodd" d="M21.318 14.674L63.3 36.505l15.99-7.809L35.788 7.271z" clip-rule="evenodd" opacity=".5"/>
                                    <path fill="#fff" fill-rule="evenodd" d="m63.312 36.505l15.978-7.818v11l-15.978 8.817V36.505z" clip-rule="evenodd" opacity=".5"/>
                                </svg>
                                <span>Package (Classes per Student)</span>
                            </span>
                            <span class="add-school-billing-option-desc">Each student has a set number of classes per month.</span>
                        </button>
                    </div>
                    <div id="addSchoolBillingSettings" class="add-school-billing-settings" aria-live="polite" aria-hidden="true">
                        <div class="add-school-billing-fields add-school-billing-fields--per-class is-hidden" data-billing-fields="perClass" aria-hidden="true">
                            <h4 class="add-school-billing-settings-title">PER CLASS SETTINGS</h4>
                            <div class="add-school-billing-settings-grid">
                                <label class="add-school-label add-school-currency-field" for="addSchoolPricePerClass">
                                    <span>Price per class <span class="required">*</span></span>
                                    <div class="add-school-currency-input-wrap">
                                        <input type="number" id="addSchoolPricePerClass" name="schoolPricePerClass" min="0" step="0.01" inputmode="decimal" value="25.00" data-billing-required="true">
                                        <select id="addSchoolPricePerClassCurrency" name="schoolPricePerClassCurrency">
                                            <option value="USD" selected>USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="BRL">BRL</option>
                                            <option value="GBP">GBP</option>
                                            <option value="CAD">CAD</option>
                                        </select>
                                    </div>
                                </label>
                                <label class="add-school-label" for="addSchoolClassDuration">
                                    <span>Class duration</span>
                                    <select id="addSchoolClassDuration" name="schoolClassDuration">
                                        <option value="30">30 minutes</option>
                                        <option value="45">45 minutes</option>
                                        <option value="50" selected>50 minutes</option>
                                        <option value="60">60 minutes</option>
                                        <option value="90">90 minutes</option>
                                    </select>
                                </label>
                                <label class="add-school-toggle-row" for="addSchoolDifferentPricesPerTeacher">
                                    <span class="add-school-toggle-copy">
                                        <span class="add-school-toggle-title">Allow different prices per teacher</span>
                                        <small>Set custom prices for each teacher</small>
                                    </span>
                                    <input type="checkbox" id="addSchoolDifferentPricesPerTeacher" name="schoolDifferentPricesPerTeacher">
                                    <span class="add-school-switch" aria-hidden="true"></span>
                                </label>
                                <label class="add-school-label add-school-currency-field" for="addSchoolDefaultPricePerClass">
                                    <span>Default price per class</span>
                                    <div class="add-school-currency-input-wrap">
                                        <input type="number" id="addSchoolDefaultPricePerClass" name="schoolDefaultPricePerClass" min="0" step="0.01" inputmode="decimal" value="25.00">
                                        <select id="addSchoolDefaultPricePerClassCurrency" name="schoolDefaultPricePerClassCurrency">
                                            <option value="USD" selected>USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="BRL">BRL</option>
                                            <option value="GBP">GBP</option>
                                            <option value="CAD">CAD</option>
                                        </select>
                                    </div>
                                </label>
                                <label class="add-school-toggle-row" for="addSchoolAllowGroupPricing">
                                    <span class="add-school-toggle-copy">
                                        <span class="add-school-toggle-title">Allow group pricing</span>
                                        <small>Set price per student for group classes</small>
                                    </span>
                                    <input type="checkbox" id="addSchoolAllowGroupPricing" name="schoolAllowGroupPricing">
                                    <span class="add-school-switch" aria-hidden="true"></span>
                                </label>
                                <label class="add-school-label" for="addSchoolGroupPriceType">
                                    <span>Group price type</span>
                                    <select id="addSchoolGroupPriceType" name="schoolGroupPriceType">
                                        <option value="perStudent" selected>Price per student</option>
                                        <option value="fixed">Fixed group price</option>
                                    </select>
                                </label>
                                <label class="add-school-label add-school-currency-field" for="addSchoolPricePerStudent">
                                    <span>Price per student <span class="required">*</span></span>
                                    <div class="add-school-currency-input-wrap">
                                        <input type="number" id="addSchoolPricePerStudent" name="schoolPricePerStudent" min="0" step="0.01" inputmode="decimal" value="10.00" data-billing-required="true">
                                        <select id="addSchoolPricePerStudentCurrency" name="schoolPricePerStudentCurrency">
                                            <option value="USD" selected>USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="BRL">BRL</option>
                                            <option value="GBP">GBP</option>
                                            <option value="CAD">CAD</option>
                                        </select>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div class="add-school-billing-fields add-school-billing-fields--monthly is-hidden" data-billing-fields="monthly" aria-hidden="true">
                            <h4 class="add-school-billing-settings-title">MONTHLY SETTINGS</h4>
                            <label class="add-school-label add-school-currency-field" for="addSchoolMonthlyFeePerStudent">
                                <span>Monthly fee per student <span class="required">*</span></span>
                                <div class="add-school-currency-input-wrap">
                                    <input type="number" id="addSchoolMonthlyFeePerStudent" name="schoolMonthlyFeePerStudent" min="0" step="0.01" inputmode="decimal" placeholder="e.g. 120.00" data-billing-required="true">
                                    <select id="addSchoolMonthlyFeeCurrency" name="schoolMonthlyFeeCurrency">
                                        <option value="USD" selected>USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="BRL">BRL</option>
                                        <option value="GBP">GBP</option>
                                        <option value="CAD">CAD</option>
                                    </select>
                                </div>
                            </label>
                        </div>
                        <div class="add-school-billing-fields add-school-billing-fields--package is-hidden" data-billing-fields="package" aria-hidden="true">
                            <h4 class="add-school-billing-settings-title">PACKAGE SETTINGS</h4>
                            <div class="add-school-billing-settings-grid add-school-billing-settings-grid--two">
                                <label class="add-school-label add-school-currency-field" for="addSchoolPackagePricePerClass">
                                    <span>Price per class <span class="required">*</span></span>
                                    <div class="add-school-currency-input-wrap">
                                        <input type="number" id="addSchoolPackagePricePerClass" name="schoolPackagePricePerClass" min="0" step="0.01" inputmode="decimal" placeholder="e.g. 25.00" data-billing-required="true">
                                        <select id="addSchoolPackagePriceCurrency" name="schoolPackagePriceCurrency">
                                            <option value="USD" selected>USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="BRL">BRL</option>
                                            <option value="GBP">GBP</option>
                                            <option value="CAD">CAD</option>
                                        </select>
                                    </div>
                                </label>
                                <label class="add-school-label" for="addSchoolClassesPerMonth">
                                    <span>Classes per month <span class="required">*</span></span>
                                    <input type="number" id="addSchoolClassesPerMonth" name="schoolClassesPerMonth" min="1" step="1" inputmode="numeric" placeholder="e.g. 8" data-billing-required="true">
                                </label>
                            </div>
                        </div>
                    </div>
                    </div>
                </label>

                <div id="addSchoolExternalWrap" class="add-school-external-wrap is-hidden" aria-hidden="true">
                    <label class="add-school-external-checkbox-row" for="addSchoolExternalCheckbox">
                        <input type="checkbox" id="addSchoolExternalCheckbox" name="schoolExternal" aria-label="Does this school use an external link">
                        <span>Does this school use an external link</span>
                    </label>
                    <div id="addSchoolExternalPanel" class="add-school-external-panel is-collapsed" aria-hidden="true">
                        <div class="add-school-external-panel-inner">
                            <div class="add-school-external-input-row">
                                <label class="add-school-label add-school-external-url-label" for="addSchoolExternalUrl">
                                    <span>External URL</span>
                                    <input type="url" id="addSchoolExternalUrl" name="schoolExternalUrl" autocomplete="url" placeholder="https://..." maxlength="2000">
                                </label>
                                <div class="add-school-external-split-row">
                                    <div class="sidebar-section-title-passport-split add-school-external-split" aria-hidden="false">
                                        <button type="button" id="addSchoolExternalOffsite" class="sidebar-section-title-passport-btn sidebar-section-title-passport-btn--offsite" aria-label="Open external link in new tab" title="Open external link">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function openAddSchoolPopup() {
        if (typeof window.requestAddPopupMode === 'function') {
            window.requestAddPopupMode('school');
        }
    }

    const registry = ensureAddPopupRegistry();
    registry.register('school', {
        mode: 'school',
        render: renderAddSchoolPopup
    });
    renderAddSchoolPopup();
    window.renderAddSchoolPopup = renderAddSchoolPopup;
    window.openAddSchoolPopup = openAddSchoolPopup;
})();
