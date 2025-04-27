// User interface for inventory management
const InventoryUI = {
    // Create inventory grid in the DOM based on dimensions
    createInventoryGrid: function(selectedFeatureCallback) {
        // This is just the default grid - it will be rebuilt by updateInventoryGrid
        // when a specific container is selected
        const grid = document.querySelector('.inventory-grid');
        grid.innerHTML = '';
        
        // Use default dimensions
        const gridWidth = InventoryConstants.GRID_WIDTH;
        const gridHeight = InventoryConstants.GRID_HEIGHT;
        
        // Update grid template for sizing
        grid.style.gridTemplateColumns = `repeat(${gridWidth}, 1fr)`;
        grid.style.gridTemplateRows = `repeat(${gridHeight}, 1fr)`;
        
        // Create grid cells
        for (let row = 0; row < gridHeight; row++) {
            for (let col = 0; col < gridWidth; col++) {
                const slot = document.createElement('div');
                slot.className = InventoryConstants.CLASSES.SLOT;
                slot.dataset.row = row;
                slot.dataset.col = col;
                slot.dataset.index = row * gridWidth + col;
                
                // Add click handler for inventory slots
                slot.addEventListener('click', (e) => {
                    const selectedFeature = selectedFeatureCallback();
                    if (selectedFeature) {
                        this.handleSlotClick(slot, selectedFeature, e);
                    }
                });
                
                // Add right-click handler for quick removal
                slot.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    const selectedFeature = selectedFeatureCallback();
                    if (selectedFeature) {
                        this.handleSlotRightClick(slot, selectedFeature);
                    }
                });
                
                grid.appendChild(slot);
            }
        }
        
        // Add key press handler for canceling item move
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && InventoryCore.selectedItem) {
                InventoryCore.cancelItemMove();
            }
        });
    },
    
    // Handle mouse wheel for quantity adjustment
    handleMouseWheel: function(e) {
        // Only adjust quantity if we have an item selected
        if (!InventoryCore.selectedItem) return;
        
        // Get item data
        const itemData = ItemDatabase.getItem(InventoryCore.selectedItem.id);
        if (!itemData || !itemData.max_stack || itemData.max_stack <= 1) return;
        
        // Determine direction (up or down)
        const direction = e.deltaY < 0 ? 1 : -1;
        
        // Get current quantity
        let currentQuantity = InventoryCore.selectedItem.quantity || 1;
        
        // Adjust quantity
        let newQuantity = Math.max(1, Math.min(itemData.max_stack, currentQuantity + direction));
        
        // Update quantity
        if (newQuantity !== currentQuantity) {
            InventoryCore.selectedItem.quantity = newQuantity;
            
            // Update preview
            const preview = document.getElementById('item-preview');
            if (preview) {
                // Remove existing stack count if any
                const existingCount = preview.querySelector('.stack-count');
                if (existingCount) {
                    existingCount.remove();
                }
                
                // Add new stack count if needed
                if (newQuantity > 1) {
                    const stackCount = document.createElement('div');
                    stackCount.className = 'stack-count';
                    stackCount.textContent = newQuantity;
                    preview.appendChild(stackCount);
                }
            }
        }
    },
    
    // Show tooltip on hover
    setupTooltip: function(map, markerPopup) {
        // Implementation remains the same
    },
    
    // Show a preview of the item being moved
    showItemPreview: function(itemId) {
        // Remove any existing preview to prevent stacking
        this.hideItemPreview();
        
        // Create a fresh preview element
        const itemPreview = document.createElement('div');
        itemPreview.id = 'item-preview';
        itemPreview.className = InventoryConstants.CLASSES.PREVIEW;
        document.body.appendChild(itemPreview);
        
        // Add mouse wheel handler for quantity adjustment
        document.addEventListener('wheel', this.handleMouseWheel);
        
        // Add keyboard rotation handler - use a simpler approach
        this.rotateKeyHandler = (e) => {
            if (e.key.toLowerCase() === 'r' && InventoryCore.selectedItem) {
                e.preventDefault();
                InventoryCore.isRotated = !InventoryCore.isRotated;
                this.showItemPreview(itemId);
            }
        };
        
        // Make sure to add the event listener globally
        document.addEventListener('keydown', this.rotateKeyHandler);
        
        // Update position on mouse move
        document.addEventListener('mousemove', this.moveItemPreview);
        
        const item = ItemDatabase.getItem(itemId);
        if (!item) return;
        
        // Get size based on rotation state
        const [width, height] = InventoryCore.isRotated ? 
            [item.size[1], item.size[0]] : item.size;
            
        // Get a sample cell to determine proper sizing
        const sampleCell = document.querySelector(`.${InventoryConstants.CLASSES.SLOT}`);
        const cellSize = sampleCell ? sampleCell.offsetWidth : 20;
        const cellGap = 2; // Match the gap in your grid CSS
        
        // Calculate dimensions
        const itemWidthPx = width * cellSize + (width - 1) * cellGap;
        const itemHeightPx = height * cellSize + (height - 1) * cellGap;
        
        // Set basic dimensions
        itemPreview.style.width = `${itemWidthPx}px`;
        itemPreview.style.height = `${itemHeightPx}px`;
        itemPreview.style.backgroundColor = item.color;
        
        // We don't rotate the image itself, just its dimensions
        itemPreview.style.transform = 'none';
        
        // Image handling
        if (item.image) {
            itemPreview.style.backgroundImage = `url(${item.image})`;
            itemPreview.style.backgroundSize = 'contain';
            itemPreview.style.backgroundPosition = 'center';
            itemPreview.style.backgroundRepeat = 'no-repeat';
        }
        
        // Add quantity indicator if needed
        if (InventoryCore.selectedItem && InventoryCore.selectedItem.quantity > 1) {
            const stackCount = document.createElement('div');
            stackCount.className = 'stack-count';
            stackCount.textContent = InventoryCore.selectedItem.quantity;
            itemPreview.appendChild(stackCount);
        }
        
        // Add rotation button
        const rotateBtn = document.createElement('button');
        rotateBtn.className = InventoryConstants.CLASSES.ROTATE_BTN;
        rotateBtn.textContent = '↻';
        rotateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            InventoryCore.isRotated = !InventoryCore.isRotated;
            this.showItemPreview(itemId);
        });
        
        itemPreview.appendChild(rotateBtn);
        
        // Add rotation instruction
        const instructionEl = document.createElement('div');
        instructionEl.className = 'rotate-instruction';
        instructionEl.textContent = 'Press R to rotate';
        itemPreview.appendChild(instructionEl);
        
        // Add hover effect to show placement possibility
        const self = this;
        const hoverHandler = function(e) {
            if (!InventoryCore.selectedItem) return;
            
            // Clear previous highlights
            InventoryUtils.clearHighlights();
            
            // Find slot under cursor
            const slot = e.target.closest(`.${InventoryConstants.CLASSES.SLOT}`);
            if (!slot) return;
            
            const item = ItemDatabase.getItem(InventoryCore.selectedItem.id);
            if (!item) return;
            
            const row = parseInt(slot.dataset.row);
            const col = parseInt(slot.dataset.col);
            
            // Get current feature
            const feature = InventoryCore.selectedItem.feature;
            if (!feature) return;
            
            // Get inventory
            let inventory = InventoryUtils.ensureValidInventory(feature);
            
            // Check if item can be placed
            const [itemWidth, itemHeight] = InventoryCore.isRotated ? 
                [item.size[1], item.size[0]] : item.size;
            
            const canPlace = InventoryCore.canPlaceItem(inventory, row, col, itemWidth, itemHeight);
            
            // Get inventory dimensions
            const gridWidth = inventory.width || InventoryConstants.GRID_WIDTH;
            const gridHeight = inventory.height || InventoryConstants.GRID_HEIGHT;
            
            // Highlight all slots the item would occupy
            for (let r = row; r < row + itemHeight && r < gridHeight; r++) {
                for (let c = col; c < col + itemWidth && c < gridWidth; c++) {
                    const index = (r * gridWidth) + c;
                    const targetSlot = document.querySelector(`.${InventoryConstants.CLASSES.SLOT}[data-index="${index}"]`);
                    if (targetSlot) {
                        const className = canPlace ? 
                            InventoryConstants.CLASSES.CAN_PLACE : 
                            InventoryConstants.CLASSES.CANNOT_PLACE;
                        targetSlot.classList.add(className);
                    }
                }
            }
        };
        
        // Add hover handler to grid
        const grid = document.querySelector('.inventory-grid');
        grid.addEventListener('mousemove', hoverHandler);
        
        // Store the handler so we can remove it later
        InventoryCore.currentHoverHandler = hoverHandler;
        InventoryCore.currentGrid = grid;
    },
    
    // Move the item preview with mouse
    moveItemPreview: function(e) {
        const preview = document.getElementById('item-preview');
        if (preview) {
            preview.style.left = `${e.clientX + 10}px`;
            preview.style.top = `${e.clientY + 10}px`;
        }
    },
    
    // Hide the item preview
    hideItemPreview: function() {
        document.removeEventListener('mousemove', this.moveItemPreview);
        document.removeEventListener('wheel', this.handleMouseWheel);
        
        // Remove the hover handler
        if (InventoryCore.currentHoverHandler && InventoryCore.currentGrid) {
            InventoryCore.currentGrid.removeEventListener('mousemove', InventoryCore.currentHoverHandler);
        }
        
        // Remove keyboard rotation handler
        if (this.rotateKeyHandler) {
            document.removeEventListener('keydown', this.rotateKeyHandler);
            this.rotateKeyHandler = null;
        }
        
        // Clear all highlights
        InventoryUtils.clearHighlights();
        
        const preview = document.getElementById('item-preview');
        if (preview) {
            preview.remove();
        }
        // Don't reset rotation state here to preserve it when picking up/placing items
        // InventoryCore.isRotated = false;
    },
    
    // Handle slot click (delegate to interaction handler)
    handleSlotClick: function(slot, feature, event) {
        InventoryInteraction.handleSlotClick(slot, feature, event);
    },
    
    // Handle slot right-click (delegate to interaction handler)
    handleSlotRightClick: function(slot, feature) {
        InventoryInteraction.handleSlotRightClick(slot, feature);
    },
    
    // Update inventory grid based on feature data and inventory size
    updateInventoryGrid: function(feature) {
        let inventory = InventoryUtils.ensureValidInventory(feature);
        const grid = document.querySelector('.inventory-grid');
        
        // Get inventory dimensions
        const gridWidth = inventory.width || InventoryConstants.GRID_WIDTH;
        const gridHeight = inventory.height || InventoryConstants.GRID_HEIGHT;
        
        // Update grid template for dynamic sizing
        grid.style.gridTemplateColumns = `repeat(${gridWidth}, 1fr)`;
        grid.style.gridTemplateRows = `repeat(${gridHeight}, 1fr)`;
        
        // Clear existing grid
        grid.innerHTML = '';
        document.querySelectorAll('.item-overlay').forEach(overlay => overlay.remove());
        
        // Create grid cells based on container dimensions
        for (let row = 0; row < gridHeight; row++) {
            for (let col = 0; col < gridWidth; col++) {
                const slot = document.createElement('div');
                slot.className = InventoryConstants.CLASSES.SLOT;
                slot.dataset.row = row;
                slot.dataset.col = col;
                slot.dataset.index = row * gridWidth + col;
                
                // Add event handlers
                slot.addEventListener('click', (e) => {
                    const selectedFeature = function() { return feature; };
                    if (feature) {
                        this.handleSlotClick(slot, feature, e);
                    }
                });
                
                slot.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if (feature) {
                        this.handleSlotRightClick(slot, feature);
                    }
                });
                
                grid.appendChild(slot);
            }
        }
        
        // Add items to grid using overlays instead of styling individual cells
        for (const instanceId in inventory.items) {
            const itemInstance = inventory.items[instanceId];
            const itemData = ItemDatabase.getItem(itemInstance.id);
            
            if (!itemData) continue;
            
            // Calculate item dimensions based on rotation
            // Here we calculate the original size regardless of rotation for the data model
            const itemWidth = itemData.size[0];
            const itemHeight = itemData.size[1];
                
            // Get starting position
            const startRow = itemInstance.row;
            const startCol = itemInstance.col;
            
            // Find the starting cell for positioning reference using dynamic grid width
            const startIndex = startRow * gridWidth + startCol;
            const startCell = document.querySelector(`.${InventoryConstants.CLASSES.SLOT}[data-index="${startIndex}"]`);
            
            if (!startCell) {
                console.warn(`Could not find cell at ${startRow},${startCol} (index ${startIndex})`);
                continue;
            }
            
            // Mark cells as occupied for interaction purposes based on data model
            const [itemSizeWidth, itemSizeHeight] = itemInstance.rotated ? 
                [itemHeight, itemWidth] : [itemWidth, itemHeight];
            
            for (let r = startRow; r < startRow + itemSizeHeight; r++) {
                for (let c = startCol; c < startCol + itemSizeWidth; c++) {
                    // Skip cells outside grid bounds
                    if (r >= gridHeight || c >= gridWidth) continue;
                    
                    const index = (r * gridWidth) + c;
                    const cell = document.querySelector(`.${InventoryConstants.CLASSES.SLOT}[data-index="${index}"]`);
                    
                    if (!cell) continue;
                    
                    // Mark this cell as part of an item (for interaction handlers)
                    cell.classList.add(InventoryConstants.CLASSES.HAS_ITEM);
                    cell.dataset.itemId = itemInstance.id;
                    cell.dataset.instanceId = instanceId;
                    
                    // Mark starting cell
                    if (r === startRow && c === startCol) {
                        cell.classList.add(InventoryConstants.CLASSES.ITEM_START);
                    }
                }
            }
            
            // Calculate dimensions for this item
            const cellSize = startCell.offsetWidth;
            const cellGap = 2; // Match the gap in your grid CSS
            
            // For direct position calculation without getBoundingClientRect
            // This helps avoid issues with scrolling or partial grid visibility
            const itemLeft = startCol * (cellSize + cellGap);
            const itemTop = startRow * (cellSize + cellGap);
            
            // Create overlay element for the entire item
            const itemOverlay = document.createElement('div');
            itemOverlay.className = 'item-overlay';
            itemOverlay.dataset.instanceId = instanceId;
            itemOverlay.dataset.itemId = itemInstance.id;
            itemOverlay.dataset.startRow = startRow;
            itemOverlay.dataset.startCol = startCol;
            
            // Position and size based on whether it's rotated
            if (itemInstance.rotated) {
                // For rotated items, swap width and height
                itemOverlay.style.width = `${itemHeight * cellSize + (itemHeight - 1) * cellGap}px`;
                itemOverlay.style.height = `${itemWidth * cellSize + (itemWidth - 1) * cellGap}px`;
                // Add rotated class for styling
                itemOverlay.classList.add('rotated-item');
                itemOverlay.dataset.rotated = 'true';
            } else {
                // Normal orientation
                itemOverlay.style.width = `${itemWidth * cellSize + (itemWidth - 1) * cellGap}px`;
                itemOverlay.style.height = `${itemHeight * cellSize + (itemHeight - 1) * cellGap}px`;
                itemOverlay.dataset.rotated = 'false';
            }
            
            // Force precise positioning of the overlay
            itemOverlay.style.position = 'absolute';
            itemOverlay.style.left = `${itemLeft}px`;
            itemOverlay.style.top = `${itemTop}px`;
            
            // Apply visual styling
            itemOverlay.style.backgroundColor = itemData.color;
            if (itemData.image) {
                itemOverlay.style.backgroundImage = `url(${itemData.image})`;
                itemOverlay.style.backgroundSize = 'contain';
                itemOverlay.style.backgroundPosition = 'center';
                itemOverlay.style.backgroundRepeat = 'no-repeat';
            }
            
            // Add stack count if item has quantity > 1
            if (itemInstance.quantity && itemInstance.quantity > 1) {
                const stackCount = document.createElement('div');
                stackCount.className = 'stack-count';
                stackCount.textContent = itemInstance.quantity;
                itemOverlay.appendChild(stackCount);
            }
            
            // Styling is now done via the .item-overlay CSS class
            
            // Click events for moving items
            itemOverlay.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event from bubbling to grid
                
                // Use the stored row/col to find the start cell
                const index = (startRow * gridWidth) + startCol;
                const targetCell = document.querySelector(`.${InventoryConstants.CLASSES.SLOT}[data-index="${index}"]`);
                
                if (targetCell) {
                    // Create a new event to simulate clicking on the start cell
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        clientX: e.clientX,
                        clientY: e.clientY,
                        ctrlKey: e.ctrlKey,
                        metaKey: e.metaKey
                    });
                    targetCell.dispatchEvent(clickEvent);
                }
            });
            
            // Add right-click event for removing items
            itemOverlay.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Use the stored row/col to find the start cell
                const index = (startRow * gridWidth) + startCol;
                const targetCell = document.querySelector(`.${InventoryConstants.CLASSES.SLOT}[data-index="${index}"]`);
                
                if (targetCell) {
                    // Create a new event to simulate right-clicking on the start cell
                    const rightClickEvent = new MouseEvent('contextmenu', {
                        bubbles: true,
                        cancelable: true
                    });
                    targetCell.dispatchEvent(rightClickEvent);
                }
            });
            
            // Add to grid
            grid.appendChild(itemOverlay);
        }
    }
};