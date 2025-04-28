// File utilities for exporting and importing markers
const FileUtils = {
    /**
     * Export markers to a JSON file
     * @param {Array} markers - Array of marker data to export
     */
    exportToFile: function(markers) {
        try {
            // Create file content
            const content = JSON.stringify(markers, null, 2);
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Create a download link and trigger it
            const link = document.createElement('a');
            link.href = url;
            link.download = `dayz-markers-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            
            // Clean up
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Error exporting markers:', error);
            return false;
        }
    },
    
    /**
     * Import markers from a JSON file
     * @param {File} file - The file to import
     * @returns {Promise<Array|null>} - Array of marker data or null if import failed
     */
    importFromFile: function(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(event) {
                try {
                    const markers = JSON.parse(event.target.result);
                    if (!Array.isArray(markers)) {
                        reject(new Error('Invalid marker data: expected an array'));
                        return;
                    }
                    resolve(markers);
                } catch (error) {
                    reject(new Error(`Error parsing file: ${error.message}`));
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Error reading file'));
            };
            
            reader.readAsText(file);
        });
    },
    
    /**
     * Create a file input and handle import
     * @param {Function} onImport - Callback function when import is successful
     */
    showImportDialog: function(onImport) {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            try {
                const markers = await this.importFromFile(file);
                onImport(markers);
            } catch (error) {
                alert(`Error importing markers: ${error.message}`);
            }
        };
        
        // Trigger file input
        input.click();
    }
};
