// Item selector component
const ItemSelector = {
    // Properties
    selectorElement: null,
    categoriesElement: null,
    itemsListElement: null,
    closeButtonElement: null,
    clickPosition: { x: 0, y: 0 },
    onItemSelect: null,
    currentCategory: 'all',
    
    // Initialize the selector
    init: function() {
        this.selectorElement = document.getElementById('item-selector');
        this.categoriesElement = document.querySelector('.item-categories');
        this.itemsListElement = document.querySelector('.items-list');
        this.closeButtonElement = document.getElementById('close-item-selector');
        
        this.setupEventListeners();
        this.populateCategories();
    },
    
    // Set up event listeners
    setupEventListeners: function() {
        // Close button
        this.closeButtonElement.addEventListener('click', () => {
            this.hide();
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (this.selectorElement.style.display === 'block' &&
                !this.selectorElement.contains(e.target) && 
                !e.target.closest('.inventory-slot')) {
                this.hide();
            }
        });
    },
    
    // Show the selector at the given position
    show: function(x, y, callback) {
        this.clickPosition.x = x;
        this.clickPosition.y = y;
        this.onItemSelect = callback;
        
        // Position near the click but ensure it stays within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const selectorWidth = 500; // Actual width from CSS
        
        // Temporarily make it visible but hidden to measure its height
        this.selectorElement.style.visibility = 'hidden';
        this.selectorElement.style.display = 'block';
        const selectorHeight = this.selectorElement.offsetHeight;
        this.selectorElement.style.visibility = 'visible';
        
        // Calculate position that keeps selector within viewport
        let posX = x;
        let posY = y;
        
        if (x + selectorWidth > viewportWidth) {
            posX = viewportWidth - selectorWidth - 10;
        }
        
        // Ensure the selector is fully visible vertically
        // If it would go below viewport, position it above the click point
        if (y + selectorHeight > viewportHeight) {
            posY = Math.max(10, y - selectorHeight);
        }
        
        this.selectorElement.style.left = posX + 'px';
        this.selectorElement.style.top = posY + 'px';
        this.selectorElement.style.display = 'block';
        
        // Refresh the items list
        this.showCategory(this.currentCategory);
    },
    
    // Hide the selector
    hide: function() {
        this.selectorElement.style.display = 'none';
        this.onItemSelect = null;
    },
    
    // Populate the categories
    populateCategories: function() {
        this.categoriesElement.innerHTML = '';
        
        // Create "All" category first
        const allButton = document.createElement('button');
        allButton.className = 'category-button active';
        allButton.dataset.category = 'all';
        allButton.textContent = 'All';
        allButton.addEventListener('click', () => this.showCategory('all'));
        this.categoriesElement.appendChild(allButton);
        
        // Get categories from the database
        const categories = ItemDatabase.getAllCategories();
        
        // Create category buttons
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-button';
            button.dataset.category = category.id;
            button.textContent = category.name;
            button.addEventListener('click', () => this.showCategory(category.id));
            this.categoriesElement.appendChild(button);
        });
    },
    
    // Show items for a specific category
    showCategory: function(category) {
        this.currentCategory = category;
        
        // Update active category button
        document.querySelectorAll('.category-button').forEach(button => {
            button.classList.toggle('active', button.dataset.category === category);
        });
        
        // Get items for the category
        let items;
        if (category === 'all') {
            items = ItemDatabase.getAllItems();
        } else {
            items = ItemDatabase.getItemsByCategory(category);
        }
        
        this.populateItemsList(items);
    },
    
    // Populate the items list
    populateItemsList: function(items) {
        this.itemsListElement.innerHTML = '';
        
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-option';
            itemElement.dataset.itemId = item.id;
            
            const colorBox = document.createElement('div');
            colorBox.className = 'item-option-color';
            colorBox.style.backgroundColor = item.color;
            
            // Try to load the image if it exists
            if (item.image) {
                // Create an image element to check if the image exists
                const img = new Image();
                img.onload = function() {
                    // Image loaded successfully, set as background
                    colorBox.style.backgroundImage = `url(${item.image})`;
                    colorBox.style.backgroundSize = 'contain';
                    colorBox.style.backgroundPosition = 'center';
                    colorBox.style.backgroundRepeat = 'no-repeat';
                    // Keep the text for size
                    colorBox.textContent = `${item.size[0]}×${item.size[1]}`;
                };
                img.onerror = function() {
                    // Image failed to load, just use the color and size text
                    colorBox.textContent = `${item.size[0]}×${item.size[1]}`;
                };
                img.src = item.image;
            } else {
                // No image defined, just use the color and size text
                colorBox.textContent = `${item.size[0]}×${item.size[1]}`;
            }
            
            const nameElement = document.createElement('div');
            nameElement.className = 'item-option-name';
            nameElement.textContent = item.name;
            
            itemElement.appendChild(colorBox);
            itemElement.appendChild(nameElement);
            
            // Add click handler to select this item
            itemElement.addEventListener('click', () => {
                if (this.onItemSelect) {
                    this.onItemSelect(item.id);
                    this.hide();
                }
            });
            
            this.itemsListElement.appendChild(itemElement);
        });
    }
};