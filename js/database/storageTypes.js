// Storage types configuration
const StorageTypes = {
    "crate": {
        name: "Wooden Crate",
        description: "Despawn time: 45 days (14 days when buried)",
        icon: "icons/crate.png", 
        markerStyle: {
            scale: 0.05,
            anchor: [0.5, 0.5]
        },
        inventorySize: {
            width: 10,
            height: 5
        }
    },
    "dry_bag": {
        name: "Dry Bag",
        description: "Despawn time: 14 days when buried",
        icon: "icons/dry_bag.png",
        markerStyle: {
            scale: 0.05,
            anchor: [0.5, 0.5]
        },
        inventorySize: {
            width: 6,
            height: 7
        }
    },
    "medium_tent": {
        name: "Medium Tent",
        description: "Despawn time: 45 days",
        icon: "icons/tent.png",
        markerStyle: {
            scale: 0.05,
            anchor: [0.5, 0.5]
        },
        inventorySize: {
            width: 10,
            height: 20
        }
    }
};

// Factory function to create a new storage marker data object
function createStorageMarker(type, coordinates, name) {
    // Get storage type configuration or default to crate
    const storageConfig = StorageTypes[type] || StorageTypes.crate;
    
    return {
        type: "storage",
        storageType: type,
        coordinates: coordinates,
        name: name || storageConfig.name,
        inventory: {
            items: {},
            width: storageConfig.inventorySize.width,
            height: storageConfig.inventorySize.height
        }
    };
}
