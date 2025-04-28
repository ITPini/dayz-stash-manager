// Marker management functionality
const MarkerManager = {
    // Initialize marker controls
    initMarkerControls: function(map, markerSource) {
        const addMarkerBtn = document.getElementById('add-marker');
        const clearMarkersBtn = document.getElementById('clear-markers');
        const saveMarkersBtn = document.getElementById('save-markers');
        const loadMarkersBtn = document.getElementById('load-markers');
        const exportMarkersBtn = document.getElementById('export-markers');
        const importMarkersBtn = document.getElementById('import-markers');
        
        const markerPopup = document.getElementById('marker-popup');
        const self = this;

        // Handle marker removal on right-click
        map.getViewport().addEventListener('contextmenu', function(evt) {
            evt.preventDefault();
            
            const pixel = map.getEventPixel(evt);
            const feature = map.forEachFeatureAtPixel(pixel, function(feature) {
                return feature;
            });
            
            if (feature && feature.get('type') === 'marker') {
                markerSource.removeFeature(feature);
                PopupManager.hidePopup(markerPopup);
            }
        });

        // Set up map click handler for adding markers
        map.on('click', function(evt) {
            if (PopupManager.addMarkerMode) {
                // Show storage type selector
                StorageManager.show(evt.originalEvent.clientX, evt.originalEvent.clientY, function(storageType) {
                    self.addMarkerAtCoordinates(markerSource, evt.coordinate, storageType);
                });
            }
        });

        // Toggle marker adding mode
        addMarkerBtn.addEventListener('click', function() {
            const newMode = !PopupManager.addMarkerMode;
            PopupManager.setAddMarkerMode(newMode);
            PopupManager.hidePopup(markerPopup);
            
            if (newMode) {
                addMarkerBtn.classList.add('active');
                map.getViewport().style.cursor = 'crosshair';
            } else {
                addMarkerBtn.classList.remove('active');
                map.getViewport().style.cursor = '';
            }
        });

        // Clear all markers
        clearMarkersBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all markers?')) {
                markerSource.clear();
                PopupManager.hidePopup(markerPopup);
            }
        });

        // Save markers to localStorage
        saveMarkersBtn.addEventListener('click', function() {
            self.saveMarkers(markerSource);
        });

        // Load markers from localStorage
        loadMarkersBtn.addEventListener('click', function() {
            self.loadMarkers(markerSource);
        });
        
        // Export markers to file
        if (exportMarkersBtn) {
            exportMarkersBtn.addEventListener('click', function() {
                self.exportMarkers(markerSource);
            });
        }
        
        // Import markers from file
        if (importMarkersBtn) {
            importMarkersBtn.addEventListener('click', function() {
                self.importMarkers(markerSource);
            });
        }
    },

    // Add a marker at specific coordinates with the given storage type
    addMarkerAtCoordinates: function(markerSource, coordinates, storageType = 'crate') {
        // Get storage type configuration
        const storageConfig = StorageTypes[storageType] || StorageTypes.crate;
        
        // Create marker feature
        const markerFeature = new ol.Feature({
            geometry: new ol.geom.Point(coordinates),
            type: 'marker',
            storageType: storageType,
            name: storageConfig.name,
            inventory: InventorySystem.createEmptyInventory(storageConfig.inventorySize.width, storageConfig.inventorySize.height)
        });

        // Store a reference to the source layer for later use
        markerFeature.set('layer', markerSource);

        // Create marker style with the appropriate icon
        const markerStyle = new ol.style.Style({
            image: new ol.style.Icon({
                src: storageConfig.icon,
                scale: storageConfig.markerStyle.scale || 0.8,
                anchor: storageConfig.markerStyle.anchor || [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction'
            })
        });

        markerFeature.set('style', markerStyle);
        markerSource.addFeature(markerFeature);
        
        return markerFeature;
    },

    // Save markers to localStorage
    saveMarkers: function(markerSource) {
        const markers = [];
        
        markerSource.getFeatures().forEach(function(feature) {
            if (feature.get('type') === 'marker') {
                const coords = feature.getGeometry().getCoordinates();
                markers.push({
                    x: coords[0],
                    y: coords[1],
                    name: feature.get('name') || 'Crate',
                    storageType: feature.get('storageType') || 'crate',
                    inventory: feature.get('inventory') || InventorySystem.createEmptyInventory()
                });
            }
        });
        
        localStorage.setItem('dayzMapMarkers', JSON.stringify(markers));
        alert('Markers saved successfully!');
    },

    // Load markers from localStorage
    loadMarkers: function(markerSource) {
        try {
            const markersData = JSON.parse(localStorage.getItem('dayzMapMarkers'));
            
            if (markersData && Array.isArray(markersData)) {
                markersData.forEach((marker) => {
                    // Get the storage type or default to crate
                    const storageType = marker.storageType || 'crate';
                    const storageConfig = StorageTypes[storageType] || StorageTypes.crate;
                    
                    // Create marker feature with saved data
                    const markerFeature = new ol.Feature({
                        geometry: new ol.geom.Point([marker.x, marker.y]),
                        type: 'marker',
                        storageType: storageType,
                        name: marker.name || storageConfig.name,
                        inventory: marker.inventory || InventorySystem.createEmptyInventory(storageConfig.inventorySize.width, storageConfig.inventorySize.height)
                    });
                    
                    // Store reference to source
                    markerFeature.set('layer', markerSource);
                    
                    // Create marker style
                    const markerStyle = new ol.style.Style({
                        image: new ol.style.Icon({
                            src: storageConfig.icon,
                            scale: storageConfig.markerStyle.scale || 0.8,
                            anchor: storageConfig.markerStyle.anchor || [0.5, 0.5],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'fraction'
                        })
                    });
                    
                    markerFeature.set('style', markerStyle);
                    markerSource.addFeature(markerFeature);
                });
                alert('Markers loaded successfully!');
            } else {
                alert('No saved markers found.');
            }
        } catch (e) {
            console.error('Error loading markers:', e);
            alert('Error loading markers: ' + e.message);
        }
    },
    
    // Export markers to file
    exportMarkers: function(markerSource) {
        const markers = [];
        
        markerSource.getFeatures().forEach(function(feature) {
            if (feature.get('type') === 'marker') {
                const coords = feature.getGeometry().getCoordinates();
                markers.push({
                    x: coords[0],
                    y: coords[1],
                    name: feature.get('name') || 'Crate',
                    storageType: feature.get('storageType') || 'crate',
                    inventory: feature.get('inventory') || InventorySystem.createEmptyInventory()
                });
            }
        });
        
        if (markers.length === 0) {
            alert('No markers to export.');
            return;
        }
        
        const success = FileUtils.exportToFile(markers);
        if (success) {
            alert('Markers exported successfully!');
        } else {
            alert('Error exporting markers. Check console for details.');
        }
    },
    
    // Import markers from file
    importMarkers: function(markerSource) {
        FileUtils.showImportDialog((markers) => {
            try {
                if (confirm(`Import ${markers.length} markers? This will not remove existing markers.`)) {
                    markers.forEach((marker) => {
                        // Get the storage type or default to crate
                        const storageType = marker.storageType || 'crate';
                        const storageConfig = StorageTypes[storageType] || StorageTypes.crate;
                        
                        // Create marker feature with imported data
                        const markerFeature = new ol.Feature({
                            geometry: new ol.geom.Point([marker.x, marker.y]),
                            type: 'marker',
                            storageType: storageType,
                            name: marker.name || storageConfig.name,
                            inventory: marker.inventory || InventorySystem.createEmptyInventory(storageConfig.inventorySize.width, storageConfig.inventorySize.height)
                        });
                        
                        // Store reference to source
                        markerFeature.set('layer', markerSource);
                        
                        // Create marker style
                        const markerStyle = new ol.style.Style({
                            image: new ol.style.Icon({
                                src: storageConfig.icon,
                                scale: storageConfig.markerStyle.scale || 0.8,
                                anchor: storageConfig.markerStyle.anchor || [0.5, 0.5],
                                anchorXUnits: 'fraction',
                                anchorYUnits: 'fraction'
                            })
                        });
                        
                        markerFeature.set('style', markerStyle);
                        markerSource.addFeature(markerFeature);
                    });
                    alert('Markers imported successfully!');
                }
            } catch (e) {
                console.error('Error importing markers:', e);
                alert('Error importing markers: ' + e.message);
            }
        });
    }
};