/**
 * ChatbotApp Class
 * Main application controller that orchestrates all modules
 */
class ChatbotApp {
    constructor() {
        this.csvLoader = new CSVLoader();
        this.majorsList = [];
        this.initializeComponents();
    }

    async initializeComponents() {
        try {
            // Load majors from CSV first
            await this.loadMajors();
            
            // Initialize all components
            this.panel = new ChatbotPanel('#chatbot-button', '#chatbot-pane', '#close-chatbot');
            this.autocomplete = new AutocompleteInput('#major', '#major-dropdown', this.majorsList);
            this.validator = new FormValidator('#student-info-form');
            this.dataManager = new StudentDataManager();
            
            // Set majors list in validator
            this.validator.setMajorsList(this.majorsList);
            
            this.init();
        } catch (error) {
            console.error('Error initializing ChatbotApp:', error);
            // Fallback to empty majors list
            this.initializeWithFallback();
        }
    }

    initializeWithFallback() {
        console.warn('Using fallback initialization without CSV data');
        this.panel = new ChatbotPanel('#chatbot-button', '#chatbot-pane', '#close-chatbot');
        this.autocomplete = new AutocompleteInput('#major', '#major-dropdown', []);
        this.validator = new FormValidator('#student-info-form');
        this.dataManager = new StudentDataManager();
        this.init();
    }

    async loadMajors() {
        try {
            console.log('Loading majors from CSV...');
            const majors = await this.csvLoader.loadCSV('Merced College Majors.csv');
            
            // Clean up major names (remove degree types in parentheses for cleaner display)
            this.majorsList = majors
                .map(major => major.replace(/\s*\([^)]*\)\s*$/, '').trim())
                .filter(major => major.length > 0)
                .sort();
            
            console.log(`Loaded ${this.majorsList.length} majors:`, this.majorsList);
        } catch (error) {
            console.error('Failed to load majors from CSV:', error);
        }
    }

    init() {
        this.setupTransferFieldToggle();
        this.setupFormSubmission();
        this.loadSavedData();
    }

    setupTransferFieldToggle() {
        const transferSelect = document.getElementById('transfer');
        const transferOther = document.getElementById('transfer-other');
        
        transferSelect.addEventListener('change', function () {
            transferOther.style.display = this.value === 'Other' ? 'block' : 'none';
        });
    }

    setupFormSubmission() {
        const form = document.getElementById('student-info-form');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!this.validator.validate()) {
                return;
            }

            this.submitForm();
        });
    }

    async submitForm() {
        const submitButton = document.getElementById('start-chat');
        const year = document.getElementById('year').value;
        const major = document.getElementById('major').value.trim();
        let transfer = document.getElementById('transfer').value;
        
        if (transfer === 'Other') {
            transfer = document.getElementById('transfer-other').value.trim() || 'unspecified';
        }

        // Show loading state
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        
        // Save user data
        const userData = this.dataManager.save({ year, major, transfer });
        
        // Show success message
        this.validator.showSuccess('Information saved! Opening chat...');
        
        // Simulate brief delay for better UX, then open chat
        setTimeout(() => {
            try {
                console.log("Student Info:", userData);
                window.open('https://chatgpt.com/g/g-CZOnevxUV-mc-assistgpt', '_blank');
                this.resetFormState(submitButton);
            } catch (error) {
                console.error('Error opening chat:', error);
                this.validator.showError('transfer', 'Unable to open chat. Please try again.');
                this.resetFormState(submitButton);
            }
        }, 1000);
    }

    resetFormState(submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
        document.getElementById('success-message').style.display = 'none';
    }

    loadSavedData() {
        document.addEventListener('DOMContentLoaded', () => {
            const userData = this.dataManager.load();
            this.dataManager.populateForm(userData);
        });
    }
}