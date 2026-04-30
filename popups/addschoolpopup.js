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
                    <div id="addSchoolBillingOptions" class="add-school-billing-options" role="radiogroup" aria-label="Billing model options">
                        <button type="button" class="add-school-billing-option" role="radio" aria-checked="false" data-billing-model="perClass">
                            <span class="add-school-billing-option-title"><span>Per class</span></span>
                            <span class="add-school-billing-option-desc">You are paid for each class you teach.</span>
                        </button>
                        <button type="button" class="add-school-billing-option" role="radio" aria-checked="false" data-billing-model="monthly">
                            <span class="add-school-billing-option-title"><span>Monthly</span></span>
                            <span class="add-school-billing-option-desc">You receive a fixed monthly fee per student.</span>
                        </button>
                        <button type="button" class="add-school-billing-option" role="radio" aria-checked="false" data-billing-model="package">
                            <span class="add-school-billing-option-title"><span>Package (Classes per Student)</span></span>
                            <span class="add-school-billing-option-desc">Each student has a set number of classes per month.</span>
                        </button>
                    </div>
                    <div id="addSchoolBillingSettings" class="add-school-billing-settings" aria-live="polite">
                        <div class="add-school-billing-fields add-school-billing-fields--per-class is-hidden" data-billing-fields="perClass" aria-hidden="true">
                            <label class="add-school-label" for="addSchoolPricePerClass">
                                <span>Price per class</span>
                                <input type="number" id="addSchoolPricePerClass" name="schoolPricePerClass" min="0" step="0.01" inputmode="decimal" placeholder="e.g. 30.00">
                            </label>
                        </div>
                        <div class="add-school-billing-fields add-school-billing-fields--monthly is-hidden" data-billing-fields="monthly" aria-hidden="true">
                            <label class="add-school-label" for="addSchoolMonthlyFeePerStudent">
                                <span>Monthly fee per student</span>
                                <input type="number" id="addSchoolMonthlyFeePerStudent" name="schoolMonthlyFeePerStudent" min="0" step="0.01" inputmode="decimal" placeholder="e.g. 120.00">
                            </label>
                        </div>
                        <div class="add-school-billing-fields add-school-billing-fields--package is-hidden" data-billing-fields="package" aria-hidden="true">
                            <label class="add-school-label" for="addSchoolPackagePricePerClass">
                                <span>Price per class</span>
                                <input type="number" id="addSchoolPackagePricePerClass" name="schoolPackagePricePerClass" min="0" step="0.01" inputmode="decimal" placeholder="e.g. 25.00">
                            </label>
                            <label class="add-school-label" for="addSchoolClassesPerMonth">
                                <span>Classes per month</span>
                                <input type="number" id="addSchoolClassesPerMonth" name="schoolClassesPerMonth" min="1" step="1" inputmode="numeric" placeholder="e.g. 8">
                            </label>
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
