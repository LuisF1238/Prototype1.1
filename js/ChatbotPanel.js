/**
 * ChatbotPanel Class
 * Handles panel toggle, keyboard navigation, and focus management
 */
class ChatbotPanel {
    constructor(buttonSelector, paneSelector, closeButtonSelector) {
        this.button = document.querySelector(buttonSelector);
        this.pane = document.querySelector(paneSelector);
        this.closeButton = document.querySelector(closeButtonSelector);
        this.init();
    }

    init() {
        this.button.addEventListener('click', () => this.toggle());
        this.closeButton.addEventListener('click', () => this.close());
        this.setupKeyboardNavigation();
        this.setupFocusTrapping();
    }

    open() {
        this.pane.classList.add('open');
        document.getElementById('year').focus();
    }

    close() {
        this.pane.classList.remove('open');
        this.button.focus();
    }

    toggle() {
        this.pane.classList.toggle('open');
        if (this.pane.classList.contains('open')) {
            document.getElementById('year').focus();
        }
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.pane.classList.contains('open')) {
                this.close();
            }
        });
    }

    setupFocusTrapping() {
        this.pane.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusableElements = this.pane.querySelectorAll(
                    'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }
}