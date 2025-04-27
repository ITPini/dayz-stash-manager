// Storage type selector UI
const StorageManager = {
    // Create a storage type selector popup
    show: function(x, y, onSelectCallback) {
        // Create popup element if not already exists
        let selectorEl = document.getElementById('storage-type-selector');
        if (!selectorEl) {
            selectorEl = document.createElement('div');
            selectorEl.id = 'storage-type-selector';
            selectorEl.className = 'storage-type-selector';
            document.body.appendChild(selectorEl);
        }
        
        // Clear any existing content
        selectorEl.innerHTML = '';
        
        // Position the selector
        selectorEl.style.left = `${x}px`;
        selectorEl.style.top = `${y}px`;
        
        // Create header
        const header = document.createElement('div');
        header.className = 'selector-header';
        header.innerHTML = `
            <h3>Select Storage Type</h3>
            <button id="close-storage-selector">×</button>
        `;
        selectorEl.appendChild(header);
        
        // Create options container
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'storage-options';
        selectorEl.appendChild(optionsContainer);
        
        // Add options for each storage type
        for (const [typeId, typeData] of Object.entries(StorageTypes)) {
            const option = document.createElement('div');
            option.className = 'storage-option';
            option.innerHTML = `
                <img src="${typeData.icon}" alt="${typeData.name}">
                <div class="storage-details">
                    <h4>${typeData.name}</h4>
                    <p>${typeData.description}</p>
                    <span class="storage-size">${typeData.inventorySize.width}x${typeData.inventorySize.height} slots</span>
                </div>
            `;
            
            // Add click handler
            option.addEventListener('click', () => {
                // Call the callback with selected type
                if (onSelectCallback) {
                    onSelectCallback(typeId);
                }
                
                // Hide selector
                this.hide();
            });
            
            optionsContainer.appendChild(option);
        }
        
        // Add close button handler
        document.getElementById('close-storage-selector').addEventListener('click', () => {
            this.hide();
        });
        
        // Show the selector
        selectorEl.style.display = 'block';
    },
    
    // Hide the selector
    hide: function() {
        const selectorEl = document.getElementById('storage-type-selector');
        if (selectorEl) {
            selectorEl.style.display = 'none';
            selectorEl.innerHTML = ''; // Clear content
        }
    }
};
