// Event management utilities
const EventManager = {
    // Event listeners
    _listeners: {},
    
    // Register event listener
    on: function(eventName, callback, context) {
        if (!this._listeners[eventName]) {
            this._listeners[eventName] = [];
        }
        
        this._listeners[eventName].push({
            callback: callback,
            context: context || this
        });
        
        return this;
    },
    
    // Remove event listener
    off: function(eventName, callback) {
        if (this._listeners[eventName]) {
            this._listeners[eventName] = this._listeners[eventName].filter(
                listener => callback && listener.callback !== callback
            );
        }
        
        return this;
    },
    
    // Trigger event
    trigger: function(eventName, ...args) {
        if (this._listeners[eventName]) {
            this._listeners[eventName].forEach(listener => {
                listener.callback.apply(listener.context, args);
            });
        }
        
        return this;
    },
    
    // One-time event listener
    once: function(eventName, callback, context) {
        const onceWrapper = (...args) => {
            callback.apply(context || this, args);
            this.off(eventName, onceWrapper);
        };
        
        return this.on(eventName, onceWrapper, context);
    },
    
    // Clear all event listeners
    clear: function(eventName) {
        if (eventName) {
            delete this._listeners[eventName];
        } else {
            this._listeners = {};
        }
        
        return this;
    }
};

// DOM event utilities
const DOMEvents = {
    // Add event listener with automatic cleanup
    addListener: function(element, eventType, handler, options) {
        if (!element) return null;
        
        element.addEventListener(eventType, handler, options);
        
        // Return a function to remove the listener
        return function() {
            element.removeEventListener(eventType, handler, options);
        };
    },
    
    // Add multiple event listeners to an element
    addListeners: function(element, events, context) {
        if (!element || !events) return null;
        
        const removers = [];
        for (const [eventType, handler] of Object.entries(events)) {
            const boundHandler = context ? handler.bind(context) : handler;
            removers.push(this.addListener(element, eventType, boundHandler));
        }
        
        // Return a function to remove all listeners
        return function() {
            removers.forEach(remover => remover());
        };
    },
    
    // Create and dispatch a custom event
    trigger: function(element, eventName, detail) {
        if (!element) return;
        
        const event = new CustomEvent(eventName, {
            bubbles: true,
            cancelable: true,
            detail: detail
        });
        
        element.dispatchEvent(event);
    },
    
    // Delegate event handling for child elements matching a selector
    delegate: function(element, eventType, selector, handler) {
        if (!element) return null;
        
        const delegatedHandler = function(event) {
            const target = event.target.closest(selector);
            if (target && element.contains(target)) {
                handler.call(target, event, target);
            }
        };
        
        return this.addListener(element, eventType, delegatedHandler);
    }
};
