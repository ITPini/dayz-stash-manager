// Application state management
const AppState = {
    // State variables
    _state: {
        addMarkerMode: false,
        moveMarkerMode: false,
        selectedFeature: null,
        map: null,
        markerSource: null,
        viewMode: 'map', // 'map' or 'inventory'
        lastSave: null,
        lastLoad: null,
        debug: false
    },
    
    // Listeners for state changes
    _listeners: {},
    
    // Initialize state
    init: function(map, markerSource) {
        this._state.map = map;
        this._state.markerSource = markerSource;
        return this;
    },
    
    // Get state property
    get: function(key) {
        return this._state[key];
    },
    
    // Set state property and trigger listeners
    set: function(key, value) {
        const oldValue = this._state[key];
        this._state[key] = value;
        
        // Notify listeners
        this._notifyListeners(key, oldValue, value);
        
        return this;
    },
    
    // Toggle boolean state property
    toggle: function(key) {
        if (typeof this._state[key] === 'boolean') {
            this.set(key, !this._state[key]);
        }
        return this;
    },
    
    // Add listener for state changes
    addListener: function(key, callback) {
        if (!this._listeners[key]) {
            this._listeners[key] = [];
        }
        this._listeners[key].push(callback);
        return this;
    },
    
    // Remove listener
    removeListener: function(key, callback) {
        if (this._listeners[key]) {
            this._listeners[key] = this._listeners[key].filter(cb => cb !== callback);
        }
        return this;
    },
    
    // Notify listeners of state change
    _notifyListeners: function(key, oldValue, newValue) {
        if (this._listeners[key]) {
            this._listeners[key].forEach(callback => {
                callback(newValue, oldValue, key);
            });
        }
    },
    
    // Debug: log state changes to console
    enableDebug: function() {
        this._state.debug = true;
        return this;
    }
};
