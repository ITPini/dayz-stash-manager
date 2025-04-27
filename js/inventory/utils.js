// Utility functions for inventory management
const InventoryUtils = {
    // Get item ID at a specific position
    getItemAtPosition: function(inventory, row, col) {
        if (!inventory || !inventory.items) return null;
        
        const items = inventory.items;
        
        for (const itemId in items) {
            const item = items[itemId];
            const itemData = ItemDatabase.getItem(item.id);
            
            if (!itemData) continue;
            
            // Calculate item dimensions based on rotation
            const [itemWidth, itemHeight] = item.rotated ? 
                [itemData.size[1], itemData.size[0]] : itemData.size;
            
            // Check if the position is within this item's bounds
            if (row >= item.row && 
                row < item.row + itemHeight && 
                col >= item.col && 
                col < item.col + itemWidth) {
                return itemId;
            }
        }
        
        return null;
    },
    
    // Ensure inventory is properly initialized
    ensureValidInventory: function(feature) {
        let inventory = feature.get('inventory');
        if (!inventory || !inventory.items) {
            // Get storage type to determine dimensions
            const storageType = feature.get('storageType') || 'crate';
            const storageConfig = StorageTypes[storageType] || StorageTypes.crate;
            
            inventory = InventoryCore.createEmptyInventory(
                storageConfig.inventorySize.width,
                storageConfig.inventorySize.height
            );
            feature.set('inventory', inventory);
        }
        return inventory;
    },
    
    // Clear placement highlights from slots
    clearHighlights: function() {
        document.querySelectorAll(
            `.${InventoryConstants.CLASSES.CAN_PLACE}, .${InventoryConstants.CLASSES.CANNOT_PLACE}`
        ).forEach(slot => {
            slot.classList.remove(
                InventoryConstants.CLASSES.CAN_PLACE, 
                InventoryConstants.CLASSES.CANNOT_PLACE
            );
        });
    }
};