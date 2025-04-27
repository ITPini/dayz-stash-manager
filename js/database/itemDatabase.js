// Main item database that combines all categories
const ItemDatabase = {
    // Get category definitions
    get categories() {
        return Categories;
    },
    
    // Get all items (combined from all categories)
    get items() {
        return {
            ...MedicalItems,
            ...FoodItems,
            ...DrinksItems,
            ...WeaponsItems,
            ...AmmunitionItems,
            ...ContainerItems
            // Add other category imports as needed
        };
    },
    
    // Get category color
    getCategoryColor: function(categoryId) {
        if (categoryId && this.categories[categoryId]) {
            return this.categories[categoryId].color;
        }
        return "#999999"; // Default gray if category not found
    },
    
    // Get an item by its ID
    getItem: function(itemId) {
        const item = this.items[itemId];
        if (item) {
            // Add category color to item
            return {
                ...item,
                color: this.getCategoryColor(item.category)
            };
        }
        return null;
    },
    
    // Get a list of all items
    getAllItems: function() {
        return Object.keys(this.items).map(id => {
            const item = this.items[id];
            return {
                id: id,
                ...item,
                color: this.getCategoryColor(item.category)
            };
        });
    },
    
    // Get all available categories
    getAllCategories: function() {
        return Object.keys(this.categories).map(id => ({
            id: id,
            ...this.categories[id]
        }));
    },
    
    // Get items by category
    getItemsByCategory: function(category) {
        return Object.keys(this.items)
            .filter(id => this.items[id].category === category)
            .map(id => {
                const item = this.items[id];
                return {
                    id: id,
                    ...item,
                    color: this.getCategoryColor(item.category)
                };
            });
    },
    
    // Get item statistics
    getStats: function() {
        const stats = {
            totalItems: Object.keys(this.items).length,
            totalCategories: Object.keys(this.categories).length,
            itemsByCategory: {}
        };
        
        // Count items per category
        Object.keys(this.categories).forEach(categoryId => {
            stats.itemsByCategory[categoryId] = this.getItemsByCategory(categoryId).length;
        });
        
        return stats;
    }
};