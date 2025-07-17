
class AutocompleteInput {
    constructor(inputSelector, dropdownSelector, dataSource, options = {}) {
        this.input = document.querySelector(inputSelector);
        this.dropdown = document.querySelector(dropdownSelector);
        this.dataSource = dataSource || [];
        this.maxResults = options.maxResults || 8;
        this.selectedIndex = -1;
        this.filteredItems = [];
        this.init();
    }

    init() {
        this.input.addEventListener('input', (e) => this.handleInput(e));
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.input.addEventListener('blur', () => this.handleBlur());
        this.input.addEventListener('focus', () => this.handleFocus());
    }

    updateDataSource(newDataSource) {
        this.dataSource = newDataSource || [];
    }

    handleInput(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length === 0) {
            this.hideDropdown();
            return;
        }
        
        const matches = this.dataSource.filter(item => 
            item.toLowerCase().includes(query)
        ).slice(0, this.maxResults);
        
        this.showDropdown(matches);
    }

    handleKeydown(e) {
        if (this.dropdown.style.display === 'none') return;
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredItems.length - 1);
                this.updateSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateSelection();
                break;
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0) {
                    this.selectItem(this.filteredItems[this.selectedIndex]);
                }
                break;
            case 'Escape':
                this.hideDropdown();
                break;
        }
    }

    handleBlur() {
        setTimeout(() => this.hideDropdown(), 150);
    }

    handleFocus() {
        if (this.input.value.trim().length > 0) {
            const query = this.input.value.toLowerCase().trim();
            const matches = this.dataSource.filter(item => 
                item.toLowerCase().includes(query)
            ).slice(0, this.maxResults);
            this.showDropdown(matches);
        }
    }

    showDropdown(matches) {
        if (matches.length === 0) {
            this.hideDropdown();
            return;
        }
        
        this.filteredItems = matches;
        this.selectedIndex = -1;
        
        this.dropdown.innerHTML = matches.map((item, index) => 
            `<div class="autocomplete-item" data-index="${index}">${item}</div>`
        ).join('');
        
        this.dropdown.style.display = 'block';
        this.attachItemClickListeners();
    }

    hideDropdown() {
        this.dropdown.style.display = 'none';
        this.selectedIndex = -1;
    }

    selectItem(item) {
        this.input.value = item;
        this.hideDropdown();
        this.input.focus();
    }

    updateSelection() {
        this.dropdown.querySelectorAll('.autocomplete-item').forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedIndex);
        });
    }

    attachItemClickListeners() {
        this.dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectItem(item.textContent);
            });
        });
    }
}