// Popup management for marker interactions
const PopupManager = {
    // Global state
    selectedFeature: null,
    moveMarkerMode: false,
    addMarkerMode: false,
    tooltip: null,

    // Initialize tooltip
    initTooltip: function() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'marker-tooltip';
        this.tooltip.style.display = 'none';
        document.body.appendChild(this.tooltip);
        return this.tooltip;
    },

    // Show tooltip on hover
    setupTooltip: function(map, markerPopup) {
        const self = this;
        map.on('pointermove', function(evt) {
            if (self.moveMarkerMode || markerPopup.style.display === 'block') return;
            
            const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
                return feature;
            });

            if (feature && feature.get('type') === 'marker') {
                const coordinates = feature.getGeometry().getCoordinates();
                const pixel = map.getPixelFromCoordinate(coordinates);
                
                self.tooltip.innerHTML = feature.get('name') || 'Crate';
                self.tooltip.style.display = 'block';
                self.tooltip.style.left = pixel[0] + 'px';
                self.tooltip.style.top = pixel[1] + 'px';
                map.getViewport().style.cursor = 'pointer';
            } else {
                self.tooltip.style.display = 'none';
                if (!self.moveMarkerMode) {
                    map.getViewport().style.cursor = self.addMarkerMode ? 'crosshair' : '';
                }
            }
        });
    },

    // Show popup for a marker feature
    showPopupForFeature: function(feature, pixel, markerPopup, markerNameInput) {
        this.selectedFeature = feature;
        
        // Get inventory dimensions
        const inventory = feature.get('inventory') || {};
        const storageType = feature.get('storageType') || 'crate';
        const storageConfig = StorageTypes[storageType] || StorageTypes.crate;
        
        // Adjust popup width based on grid size
        const gridWidth = inventory.width || storageConfig.inventorySize.width || 10;
        const slotSize = 30; // Approximate size of a slot in pixels
        const padding = 20; // Account for padding
        const minWidth = 350; // Minimum width
        
        // Calculate width based on grid size
        const calculatedWidth = (gridWidth * slotSize) + padding;
        markerPopup.style.width = `${Math.max(minWidth, calculatedWidth)}px`;
        
        // Position popup - adjust for large inventories
        const [x, y] = pixel;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Ensure popup stays within viewport
        let leftPos = x;
        if (leftPos + markerPopup.offsetWidth > viewportWidth) {
            leftPos = Math.max(10, viewportWidth - markerPopup.offsetWidth - 10);
        }
        
        let topPos = y;
        if (topPos + 300 > viewportHeight) { // Use an estimated height initially
            topPos = Math.max(10, viewportHeight - 300 - 10);
        }
        
        markerPopup.style.left = leftPos + 'px';
        markerPopup.style.top = topPos + 'px';
        
        // Set name in input
        markerNameInput.value = feature.get('name') || storageConfig.name;
        
        // Ensure inventory exists and initialize if needed
        if (!feature.get('inventory')) {
            feature.set('inventory', InventorySystem.createEmptyInventory(
                storageConfig.inventorySize.width, 
                storageConfig.inventorySize.height
            ));
        }
        
        // Update inventory grid with feature data
        InventorySystem.updateInventoryGrid(feature);
        
        // Force repaint of inventory items to ensure they appear
        setTimeout(() => {
            InventorySystem.updateInventoryGrid(feature);
            
            // After updating the grid, check again if popup needs repositioning
            // based on its actual height
            if (markerPopup.offsetHeight + topPos > viewportHeight) {
                topPos = Math.max(10, viewportHeight - markerPopup.offsetHeight - 10);
                markerPopup.style.top = topPos + 'px';
            }
        }, 50);
                
        // Show popup
        markerPopup.style.display = 'block';
    },

    // Hide popup
    hidePopup: function(markerPopup) {
        markerPopup.style.display = 'none';
        this.moveMarkerMode = false;
        document.getElementById('move-marker')?.classList.remove('active');
    },

    // Setup popup event handlers
    setupPopupEvents: function(map, markerPopup, markerNameInput) {
        const self = this;
        const closePopupBtn = document.getElementById('close-popup');
        const moveMarkerBtn = document.getElementById('move-marker');
        const removeMarkerBtn = document.getElementById('remove-marker');
        
        // Close button
        closePopupBtn.addEventListener('click', () => self.hidePopup(markerPopup));
        
        // Update name when input changes
        markerNameInput.addEventListener('change', function() {
            if (self.selectedFeature) {
                self.selectedFeature.set('name', markerNameInput.value);
            }
        });
        
        // Move marker button
        moveMarkerBtn.addEventListener('click', function() {
            if (self.selectedFeature) {
                self.moveMarkerMode = !self.moveMarkerMode;
                
                if (self.moveMarkerMode) {
                    moveMarkerBtn.classList.add('active');
                    map.getViewport().style.cursor = 'crosshair';
                    markerPopup.style.display = 'none';
                } else {
                    moveMarkerBtn.classList.remove('active');
                    map.getViewport().style.cursor = '';
                }
            }
        });
        
        // Remove marker button
        removeMarkerBtn.addEventListener('click', function() {
            if (self.selectedFeature) {
                const markerSource = self.selectedFeature.get('layer');
                if (markerSource) {
                    markerSource.removeFeature(self.selectedFeature);
                }
                self.hidePopup(markerPopup);
            }
        });
    },

    // Setup marker click handler
    setupMarkerClickHandler: function(map, markerPopup, markerNameInput) {
        const self = this;
        map.on('click', function(evt) {
            const clickedFeature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
                return feature;
            });
            
            if (!clickedFeature && !self.moveMarkerMode) {
                self.hidePopup(markerPopup);
            }
            
            if (clickedFeature && clickedFeature.get('type') === 'marker' && !self.addMarkerMode && !self.moveMarkerMode) {
                // Show popup for marker
                self.showPopupForFeature(clickedFeature, evt.pixel, markerPopup, markerNameInput);
                self.tooltip.style.display = 'none';
            } else if (self.addMarkerMode) {
                // Add new marker is handled by markerManager
            } else if (self.moveMarkerMode && self.selectedFeature) {
                // Move selected marker to new location
                self.selectedFeature.getGeometry().setCoordinates(evt.coordinate);
                self.moveMarkerMode = false;
                document.getElementById('move-marker').classList.remove('active');
                self.hidePopup(markerPopup);
                map.getViewport().style.cursor = '';
            }
        });
    },

    // Get the currently selected feature (used by other modules)
    getSelectedFeature: function() {
        return this.selectedFeature;
    },

    // Set the addMarkerMode state
    setAddMarkerMode: function(mode) {
        this.addMarkerMode = mode;
    }
};