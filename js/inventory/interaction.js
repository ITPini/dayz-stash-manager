// User interaction functionality for inventory
const InventoryInteraction = {
    // Initialize interaction handlers
    init: function() {
        // Add keyboard handler for rotation
        document.addEventListener('keydown', this.handleKeyDown);
    },
    
    // Handle keyboard events
    handleKeyDown: function(e) {
        // Check for R key to rotate item
        if (e.key.toLowerCase() === 'r' && InventoryCore.selectedItem) {
            e.preventDefault();
            // Toggle the rotation state
            InventoryCore.isRotated = !InventoryCore.isRotated;
            // Update the item preview with new rotation
            InventoryUI.hideItemPreview();
            InventoryUI.showItemPreview(InventoryCore.selectedItem.id);
        }
    },
    // Handle click on inventory slot
    handleSlotClick: function(slotElement, feature, event) {
        const row = parseInt(slotElement.dataset.row);
        const col = parseInt(slotElement.dataset.col);
        
        // Get current inventory state
        let inventory = InventoryUtils.ensureValidInventory(feature);
        
        // Check if slot has an item
        const existingItemId = InventoryUtils.getItemAtPosition(inventory, row, col);
        
        if (existingItemId) {
            // If we click on an existing item, pick it up or clear it
            if (event.ctrlKey || event.metaKey) {
                // Clear item with Ctrl+click
                InventoryCore.removeItem(inventory, existingItemId);
                feature.set('inventory', inventory);
                InventoryUI.updateInventoryGrid(feature);
            } else if (InventoryCore.selectedItem) {
                // If we have an item selected and click on another item

                // First check if we can stack these items
                if (this.canStackItems(inventory, InventoryCore.selectedItem.id, existingItemId)) {
                    // Try to stack the items
                    const stackingComplete = this.stackItems(feature, existingItemId, InventoryCore.selectedItem.id);
                    
                    // If stacking is complete, clear selection
                    if (stackingComplete) {
                        InventoryCore.selectedItem = null;
                        InventoryUI.hideItemPreview();
                        return;
                    } else {
                        // If stacking was partial (we still have some remaining),
                        // don't proceed to swap - just keep the remaining in hand
                        return;
                    }
                }
                
                // If not stackable or stacking failed, try to swap items
                this.trySwapItems(feature, row, col, existingItemId);
            } else {
                // Create a deep copy of the inventory before modifying it
                const originalInventory = JSON.parse(JSON.stringify(inventory));
                
                // Store the item data before removing it
                const itemInstance = inventory.items[existingItemId];
                const itemData = {
                    id: itemInstance.id,
                    rotated: itemInstance.rotated,
                    quantity: itemInstance.quantity || 1
                };
                
                // Remove from current position
                InventoryCore.removeItem(inventory, existingItemId);
                feature.set('inventory', inventory);
                
                // Pick up item
                InventoryCore.selectedItem = {
                    id: itemData.id,
                    instanceId: existingItemId,
                    inventory: originalInventory,
                    feature: feature,
                    rotated: itemData.rotated,
                    quantity: itemData.quantity
                };
                
                InventoryCore.isRotated = itemData.rotated;
                InventoryUI.updateInventoryGrid(feature);
                InventoryUI.showItemPreview(itemData.id);
            }
        } else if (InventoryCore.selectedItem) {
            // Try to place the selected item at this position
            const item = ItemDatabase.getItem(InventoryCore.selectedItem.id);
            const [itemWidth, itemHeight] = InventoryCore.isRotated ? 
                [item.size[1], item.size[0]] : item.size;
            
            // Check if there's an existing item at this position
            const existingItemId = InventoryUtils.getItemAtPosition(inventory, row, col);
            
            if (existingItemId) {
                // Try to swap items
                this.trySwapItems(feature, row, col, existingItemId);
            } else if (InventoryCore.canPlaceItem(inventory, row, col, itemWidth, itemHeight)) {
                // Place item in empty space with its quantity
                const quantity = InventoryCore.selectedItem.quantity || 1;
                const rotated = InventoryCore.isRotated;
                InventoryCore.placeItem(inventory, InventoryCore.selectedItem.id, row, col, rotated, quantity);
                feature.set('inventory', inventory);
                
                // Clear selection after successful placement
                const wasRotated = InventoryCore.isRotated; // Store rotation state
                InventoryCore.selectedItem = null;
                InventoryUI.hideItemPreview();
                
                // Update grid
                InventoryUI.updateInventoryGrid(feature);
            }
        } else {
            // Show item selector menu at the click position
            const rect = event.target.getBoundingClientRect();
            ItemSelector.show(event.clientX, event.clientY, (itemId) => {
                // When item is selected, add it to inventory
                const selectedItem = ItemDatabase.getItem(itemId);
                if (selectedItem) {
                    // Check if item fits at this position
                    const [itemWidth, itemHeight] = selectedItem.size;
                    if (InventoryCore.canPlaceItem(inventory, row, col, itemWidth, itemHeight)) {
                        // Default quantity is 1
                        InventoryCore.placeItem(inventory, itemId, row, col, false, 1);
                        feature.set('inventory', inventory);
                        InventoryUI.updateInventoryGrid(feature);
                    }
                }
            });
        }
    },
    
    // Handle right-click on inventory slot (for quick removal)
    handleSlotRightClick: function(slotElement, feature) {
        const row = parseInt(slotElement.dataset.row);
        const col = parseInt(slotElement.dataset.col);
        
        // Get current inventory state
        let inventory = InventoryUtils.ensureValidInventory(feature);
        
        // Check if slot has an item
        const existingItemId = InventoryUtils.getItemAtPosition(inventory, row, col);
        
        if (existingItemId) {
            // Remove the item
            InventoryCore.removeItem(inventory, existingItemId);
            feature.set('inventory', inventory);
            InventoryUI.updateInventoryGrid(feature);
        }
    },
    
    // Check if an item can be stacked with another item
    canStackItems: function(inventory, itemId, targetInstanceId) {
        // Get the item data
        const itemData = ItemDatabase.getItem(itemId);
        const targetItem = inventory.items[targetInstanceId];
        
        if (!itemData || !targetItem) return false;
        
        // Check if target item is the same type
        if (targetItem.id !== itemId) return false;
        
        // Check if item has max_stack property
        if (!itemData.max_stack || itemData.max_stack <= 1) return false;
        
        // Check if target item is at max stack
        const currentQuantity = targetItem.quantity || 1;
        return currentQuantity < itemData.max_stack;
    },
    
    // Handle stacking items
    stackItems: function(feature, instanceId, selectedItemId) {
        // Get current inventory
        let inventory = InventoryUtils.ensureValidInventory(feature);
        
        // Get target item
        const targetItem = inventory.items[instanceId];
        if (!targetItem) return false;
        
        // Get item data
        const itemData = ItemDatabase.getItem(selectedItemId);
        if (!itemData || !itemData.max_stack) return false;
        
        // Calculate new quantity - combine both stacks
        const targetQuantity = targetItem.quantity || 1;
        const selectedQuantity = InventoryCore.selectedItem.quantity || 1;
        const totalQuantity = targetQuantity + selectedQuantity;
        
        // If total is less than or equal to max stack, simply combine
        if (totalQuantity <= itemData.max_stack) {
            inventory.items[instanceId].quantity = totalQuantity;
            feature.set('inventory', inventory);
            InventoryUI.updateInventoryGrid(feature);
            return true;
        } else {
            // Otherwise, fill the target stack and keep the rest in hand
            const remainingQuantity = totalQuantity - itemData.max_stack;
            
            // Update target stack to max
            inventory.items[instanceId].quantity = itemData.max_stack;
            feature.set('inventory', inventory);
            
            // Update selected item with remaining quantity
            InventoryCore.selectedItem.quantity = remainingQuantity;
            
            // Update UI
            InventoryUI.updateInventoryGrid(feature);
            
            // Refresh the item preview to show updated quantity
            InventoryUI.hideItemPreview();
            InventoryUI.showItemPreview(selectedItemId);
            
            return false; // Return false since we're keeping the selected item
        }
    },
    
    // Directly replace items - pick up clicked item and put down held item
    trySwapItems: function(feature, row, col, existingItemInstanceId) {
        // Get the current inventory
        let inventory = InventoryUtils.ensureValidInventory(feature);
        
        // Make sure we have valid items
        if (!InventoryCore.selectedItem) return;
        const existingItemInstance = inventory.items[existingItemInstanceId];
        if (!existingItemInstance) return;
        
        // If the user clicks on a different part of the same item, do nothing
        if (existingItemInstanceId === InventoryCore.selectedItem.instanceId) return;
        
        // Create backup of the inventory
        const originalInventory = JSON.parse(JSON.stringify(inventory));
        
        // Store information about the clicked item before removing it
        const clickedItem = {
            id: existingItemInstance.id,
            row: existingItemInstance.row,
            col: existingItemInstance.col,
            rotated: existingItemInstance.rotated,
            quantity: existingItemInstance.quantity || 1
        };
        
        // Store the current held item info
        const heldItem = {
            id: InventoryCore.selectedItem.id,
            rotated: InventoryCore.isRotated,
            quantity: InventoryCore.selectedItem.quantity || 1
        };
        
        // 1. Remove the clicked item
        InventoryCore.removeItem(inventory, existingItemInstanceId);
        
        // 2. Try to place the currently held item at the clicked item's position
        const heldItemData = ItemDatabase.getItem(heldItem.id);
        
        if (!heldItemData) {
            // Restore inventory if item data is invalid
            feature.set('inventory', originalInventory);
            return;
        }
        
        const [heldWidth, heldHeight] = heldItem.rotated ? 
            [heldItemData.size[1], heldItemData.size[0]] : 
            heldItemData.size;
        
        // Check if held item fits at clicked item's position
        if (InventoryCore.canPlaceItem(inventory, clickedItem.row, clickedItem.col, heldWidth, heldHeight)) {
            // Place held item with its quantity
            InventoryCore.placeItem(
                inventory, 
                heldItem.id, 
                clickedItem.row, 
                clickedItem.col, 
                heldItem.rotated,
                heldItem.quantity
            );
            
            // Update the inventory
            feature.set('inventory', inventory);
            
            // Set clicked item as new held item
            InventoryCore.selectedItem = {
                id: clickedItem.id,
                rotated: clickedItem.rotated,
                feature: feature,
                inventory: originalInventory,
                quantity: clickedItem.quantity
            };
            
            // Set rotation state for preview
            InventoryCore.isRotated = clickedItem.rotated;
            
            // Update UI - hide current preview and show new one
            InventoryUI.hideItemPreview();
            InventoryUI.showItemPreview(clickedItem.id);
            InventoryUI.updateInventoryGrid(feature);
        } else {
            // If held item doesn't fit, restore original inventory
            feature.set('inventory', originalInventory);
            InventoryUI.updateInventoryGrid(feature);
        }
    }
};