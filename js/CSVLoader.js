/**
 * CSVLoader Class
 */
class CSVLoader {
    constructor() {
        this.cache = new Map();
    }

    async loadCSV(filePath) {
        // Check cache first
        if (this.cache.has(filePath)) {
            return this.cache.get(filePath);
        }

        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const csvText = await response.text();
            const data = this.parseCSV(csvText);
            
            // Cache the result
            this.cache.set(filePath, data);
            return data;
        } catch (error) {
            console.error('Error loading CSV:', error);
            throw error;
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        return lines.map(line => this.parseLine(line)).filter(line => line.trim() !== '');
    }

    parseLine(line) {
        // Handle quoted fields and commas within quotes
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result[0] || ''; // Return first column (major name)
    }

    clearCache() {
        this.cache.clear();
    }
}