// Main inventory system module that ties everything together
const InventorySystem = {
    // Initialize the inventory system
    init: function(selectedFeatureCallback) {
        // Create the inventory grid
        InventoryUI.createInventoryGrid(selectedFeatureCallback);
        
        // Initialize interaction handlers
        InventoryInteraction.init();
    },
    
    // Create an empty inventory data structure
    createEmptyInventory: function(width, height) {
        return InventoryCore.createEmptyInventory(width, height);
    },
    
    // Handle slot click (delegated to interaction module)
    handleSlotClick: function(slotElement, feature, event) {
        InventoryInteraction.handleSlotClick(slotElement, feature, event);
    },
    
    // Update the inventory grid display
    updateInventoryGrid: function(feature) {
        InventoryUI.updateInventoryGrid(feature);
    },
    
    // Get the selected feature callback
    getSelectedFeature: function() {
        return InventoryCore.selectedItem ? InventoryCore.selectedItem.feature : null;
    }
};