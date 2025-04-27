// Map controller responsible for handling map-related logic
const MapController = {
    // Initialize the map controller
    init: function(mapElementId) {
        this.mapElementId = mapElementId;
        
        // Initialize map when image is loaded
        this.loadMapImage()
            .then(dimensions => this.initializeMap(dimensions))
            .catch(error => console.error('Error initializing map:', error));
            
        return this;
    },
    
    // Load the map image and get dimensions
    loadMapImage: function() {
        return new Promise((resolve, reject) => {
            const mapImage = new Image();
            const mapPath = MapConfig.default.path;
            mapImage.src = mapPath;
            
            mapImage.onload = function() {
                resolve({
                    width: this.width,
                    height: this.height
                });
            };
            
            mapImage.onerror = function() {
                reject(new Error(`Failed to load map image: ${mapPath}`));
            };
        });
    },
    
    // Initialize the map with OpenLayers
    initializeMap: function({ width, height }) {
        // Define map extent based on the image dimensions
        const extent = [0, 0, width, height];
        
        // Create a custom projection
        const projection = new ol.proj.Projection({
            code: 'map-image',
            units: 'pixels',
            extent: extent
        });

        // Create the static image source
        const imageSource = new ol.source.ImageStatic({
            url: MapConfig.default.path,
            imageExtent: extent,
            projection: projection
        });

        // Create the map layer
        const imageLayer = new ol.layer.Image({
            source: imageSource
        });

        // Create a source for vector features (markers)
        const markerSource = new ol.source.Vector();

        // Create a vector layer for markers
        const markerLayer = new ol.layer.Vector({
            source: markerSource,
            style: function(feature) {
                return feature.get('style');
            }
        });

        // Create the map
        const map = new ol.Map({
            layers: [
                imageLayer,
                markerLayer
            ],
            target: this.mapElementId,
            view: new ol.View({
                projection: projection,
                center: ol.extent.getCenter(extent),
                zoom: MapConfig.default.defaultZoom,
                maxZoom: MapConfig.default.maxZoom,
                minZoom: MapConfig.default.minZoom,
                extent: extent
            }),
            controls: [
                new ol.control.Zoom(),
                new ol.control.FullScreen(),
                new ol.control.ZoomSlider(),
                new ol.control.ScaleLine({
                    units: 'metric'
                })
            ],
            interactions: [
                new ol.interaction.DragPan(),
                new ol.interaction.MouseWheelZoom(),
                new ol.interaction.DoubleClickZoom()
            ]
        });
        
        // Store references
        this.map = map;
        this.markerSource = markerSource;
        
        // Initialize state and managers
        AppState.init(map, markerSource);
        
        // Initialize other components
        this.initializeComponents();
        
        // Dispatch event that map is ready
        EventManager.trigger('map:ready', map, markerSource);
        
        return { map, markerSource };
    },
    
    // Initialize other map-related components
    initializeComponents: function() {
        // Initialize marker controls
        MarkerManager.initMarkerControls(this.map, this.markerSource);
        
        // Initialize popup components
        PopupManager.initTooltip();
        PopupManager.setupTooltip(this.map, document.getElementById('marker-popup'));
        PopupManager.setupPopupEvents(this.map, document.getElementById('marker-popup'), document.getElementById('marker-name'));
        PopupManager.setupMarkerClickHandler(this.map, document.getElementById('marker-popup'), document.getElementById('marker-name'));
        
        // Initialize inventory grid with access to selected feature
        InventorySystem.init(function() {
            return PopupManager.getSelectedFeature();
        });
        
        // Initialize item selector
        ItemSelector.init();
    },
    
    // Get current map coordinates at mouse position
    getCoordinatesAtPixel: function(pixel) {
        if (!this.map) return null;
        return this.map.getCoordinateFromPixel(pixel);
    },
    
    // Center map on a feature
    centerOnFeature: function(feature) {
        if (!this.map || !feature) return;
        
        const geometry = feature.getGeometry();
        if (geometry) {
            const center = geometry.getCoordinates();
            this.map.getView().animate({
                center: center,
                duration: 500
            });
        }
    },
    
    // Center map on coordinates
    centerOnCoordinates: function(coordinates) {
        if (!this.map) return;
        
        this.map.getView().animate({
            center: coordinates,
            duration: 500
        });
    },
    
    // Add a marker at coordinates
    addMarkerAt: function(coordinates, name = 'Crate') {
        if (!this.markerSource) return null;
        
        // Create marker feature
        const markerFeature = new ol.Feature({
            geometry: new ol.geom.Point(coordinates),
            type: 'marker',
            name: name,
            inventory: InventorySystem.createEmptyInventory()
        });

        // Store a reference to the source layer for later use
        markerFeature.set('layer', this.markerSource);

        // Create marker style with the configured icon
        const markerConfig = MapConfig.markers.default;
        const markerStyle = new ol.style.Style({
            image: new ol.style.Icon({
                src: markerConfig.icon,
                scale: markerConfig.scale,
                anchor: markerConfig.anchor,
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction'
            })
        });

        markerFeature.set('style', markerStyle);
        this.markerSource.addFeature(markerFeature);
        
        return markerFeature;
    }
};
