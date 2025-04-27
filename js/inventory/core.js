// Core inventory functionality
const InventoryCore = {
    // State
    selectedItem: null,
    isRotated: false,
    currentHoverHandler: null,
    currentGrid: null,
    
    // Create an empty inventory data structure
    createEmptyInventory: function(width = InventoryConstants.GRID_WIDTH, height = InventoryConstants.GRID_HEIGHT) {
        return {
            items: {}, // Map of itemId -> {id, row, col, rotated}
            width: width,
            height: height
        };
    },
    
    // Convert row, col to index (for a specific inventory)
    coordsToIndex: function(row, col, inventory) {
        // Use inventory-specific width if available, otherwise default
        const gridWidth = inventory?.width || InventoryConstants.GRID_WIDTH;
        return row * gridWidth + col;
    },
    
    // Check if an item can be placed at a position
    canPlaceItem: function(inventory, startRow, startCol, itemWidth, itemHeight) {
        // Get the inventory dimensions
        const gridWidth = inventory.width || InventoryConstants.GRID_WIDTH;
        const gridHeight = inventory.height || InventoryConstants.GRID_HEIGHT;
        
        // Check if any part of the item would go outside the grid
        if (startRow + itemHeight > gridHeight || 
            startCol + itemWidth > gridWidth) {
            return false;
        }
        
        // Check each cell the item would occupy
        for (let row = startRow; row < startRow + itemHeight; row++) {
            for (let col = startCol; col < startCol + itemWidth; col++) {
                if (InventoryUtils.getItemAtPosition(inventory, row, col)) {
                    return false;
                }
            }
        }
        
        return true;
    },
    
    // Place an item in the inventory
    placeItem: function(inventory, itemId, row, col, rotated, quantity = 1) {
        if (!inventory.items) {
            inventory.items = {};
        }
        
        const uniqueId = Date.now().toString(); // Generate a unique instance ID
        inventory.items[uniqueId] = {
            id: itemId,
            row: row,
            col: col,
            rotated: rotated,
            quantity: quantity
        };
    },
    
    // Remove an item from the inventory
    removeItem: function(inventory, instanceId) {
        if (inventory && inventory.items && inventory.items[instanceId]) {
            delete inventory.items[instanceId];
        }
    },
    
    // Cancel current item move operation
    cancelItemMove: function() {
        if (this.selectedItem) {
            // Put the item back in its original inventory
            if (this.selectedItem.inventory && this.selectedItem.feature) {
                // Only restore the item if its original feature and inventory still exist
                this.selectedItem.feature.set('inventory', this.selectedItem.inventory);
                InventoryUI.updateInventoryGrid(this.selectedItem.feature);
            }
            
            // Clear selection
            this.selectedItem = null;
            InventoryUI.hideItemPreview();
        }
    }
};