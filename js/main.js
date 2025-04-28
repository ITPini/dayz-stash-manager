// Main entry point for the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    const App = {
        init: function() {
            // Initialize the map controller
            MapController.init('map');
            
            // Register global event listeners
            this.setupGlobalEvents();
            
            // Enable state debugging if in development
            if (this.isDevelopment()) {
                AppState.enableDebug();
            }
            
            // Display welcome message
            if (!localStorage.getItem('dayzMapWelcomeSeen')) {
                this.showWelcomeMessage();
                localStorage.setItem('dayzMapWelcomeSeen', 'true');
            }
        },
        
        // Set up global event listeners
        setupGlobalEvents: function() {
            // Keyboard shortcuts
            document.addEventListener('keydown', function(e) {
                // Escape key - Cancel current operation
                if (e.key === 'Escape') {
                    if (AppState.get('addMarkerMode')) {
                        AppState.set('addMarkerMode', false);
                        document.getElementById('add-marker')?.classList.remove('active');
                        document.body.style.cursor = '';
                    }
                    
                    if (AppState.get('moveMarkerMode')) {
                        AppState.set('moveMarkerMode', false);
                        document.getElementById('move-marker')?.classList.remove('active');
                        document.body.style.cursor = '';
                    }
                    
                    PopupManager.hidePopup(document.getElementById('marker-popup'));
                    InventoryUI.hideItemPreview();
                }
                
                // We'll handle R key in the InventoryUI module instead
            });
        },
        
        // Check if we're in development mode
        isDevelopment: function() {
            return window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.href.indexOf('debug=true') !== -1;
        },
        
        // Show welcome message for first-time users
        showWelcomeMessage: function() {
            const message = `
                <h2>Welcome to DayZ Chernarus Interactive Map!</h2>
                <p>This tool allows you to:</p>
                <ul>
                    <li>Add markers for your stashes on the map</li>
                    <li>Track inventory for each stash location</li>
                    <li>Save and share your markers with friends</li>
                </ul>
                <p>To get started, click the 📍 button to add a marker.</p>
            `;
            
            // Create modal element
            const modal = document.createElement('div');
            modal.className = 'welcome-modal';
            modal.innerHTML = `
                <div class="welcome-content">
                    ${message}
                    <button id="welcome-close">Get Started</button>
                </div>
            `;
            
            // Add styles inline to avoid requiring a CSS update
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.zIndex = '1000';
            
            const content = modal.querySelector('.welcome-content');
            content.style.backgroundColor = '#fff';
            content.style.padding = '20px';
            content.style.borderRadius = '5px';
            content.style.maxWidth = '500px';
            content.style.width = '80%';
            
            document.body.appendChild(modal);
            
            // Close button event
            document.getElementById('welcome-close').addEventListener('click', function() {
                modal.remove();
            });
        }
    };
    
    // Initialize the application
    App.init();
});