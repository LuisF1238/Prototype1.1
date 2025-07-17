/**
 * FormValidator Class
 * Handles form validation and Future error display
 */
class FormValidator {
    constructor(formSelector, validationRules = {}) {
        this.form = document.querySelector(formSelector);
        this.validationRules = validationRules;
        this.majorsList = [];
    }

    setMajorsList(majors) {
        this.majorsList = majors || [];
    }

    clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });
        document.getElementById('success-message').style.display = 'none';
    }

    showError(fieldId, message) {
        const errorEl = document.getElementById(fieldId + '-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    showSuccess(message) {
        const successEl = document.getElementById('success-message');
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
        }
    }

    validateField(fieldId, value, rules) {
        if (rules.required && (!value || value.trim() === '')) {
            this.showError(fieldId, rules.requiredMessage || 'This field is required');
            return false;
        }

        if (rules.minLength && value.length < rules.minLength) {
            this.showError(fieldId, rules.minLengthMessage || `Must be at least ${rules.minLength} characters`);
            return false;
        }

        if (rules.custom && !rules.custom(value)) {
            this.showError(fieldId, rules.customMessage || 'Invalid value');
            return false;
        }

        return true;
    }

    validate() {
        this.clearErrors();
        let isValid = true;

        const year = document.getElementById('year').value;
        const major = document.getElementById('major').value.trim();
        const transfer = document.getElementById('transfer').value;
        const transferOther = document.getElementById('transfer-other').value.trim();

        // Validate year
        if (!this.validateField('year', year, {
            required: true,
            requiredMessage: 'Please select your year'
        })) {
            isValid = false;
        }

        // Validate major
        if (!this.validateField('major', major, {
            required: true,
            minLength: 2,
            requiredMessage: 'Please enter your major',
            minLengthMessage: 'Major must be at least 2 characters'
        })) {
            isValid = false;
        }

        // Validate transfer school
        if (transfer === 'Other' && !this.validateField('transfer-other', transferOther, {
            required: true,
            requiredMessage: 'Please specify the school name'
        })) {
            isValid = false;
        }

        // Optional: Warn if major is not in the list
        if (major && this.majorsList.length > 0 && !this.majorsList.some(m => m.toLowerCase() === major.toLowerCase())) {
            console.log('Note: Major not found in Merced College majors list:', major);
        }

        return isValid;
    }
}