/**
 * StudentDataManager Class
 * Handles data persistence and form population
 */
class StudentDataManager {
    constructor() {
        this.storageKey = 'studentInfo';
        this.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    }

    save(data) {
        const userData = { ...data, timestamp: Date.now() };
        localStorage.setItem(this.storageKey, JSON.stringify(userData));
        return userData;
    }

    load() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (!savedData) return null;

            const userData = JSON.parse(savedData);
            
            // Check if data is still valid (less than maxAge)
            if (Date.now() - userData.timestamp > this.maxAge) {
                this.clear();
                return null;
            }

            return userData;
        } catch (error) {
            console.warn('Error loading saved data:', error);
            this.clear();
            return null;
        }
    }

    clear() {
        localStorage.removeItem(this.storageKey);
    }

    populateForm(userData) {
        if (!userData) return;

        document.getElementById('year').value = userData.year || '';
        document.getElementById('major').value = userData.major || '';
        document.getElementById('transfer').value = userData.transfer || 'UC Merced';
        
        const validTransfers = ['UC Merced', 'Stanislaus State', 'Fresno State'];
        if (userData.transfer === 'Other' || !validTransfers.includes(userData.transfer)) {
            document.getElementById('transfer').value = 'Other';
            document.getElementById('transfer-other').value = userData.transfer;
            document.getElementById('transfer-other').style.display = 'block';
        }
    }
}