// Map configuration
const MapConfig = {
    // Default map settings
    default: {
        name: "Chernarus",
        path: "assets/high_res_chernarus_sa_map.jpg",
        defaultZoom: 2,
        maxZoom: 8,
        minZoom: 1,
        controls: {
            fullScreen: true,
            zoomSlider: true,
            scaleBar: true,
            scaleUnits: "metric"
        }
    },
    
    // Map-specific markers
    markers: {
        // Default marker icon
        default: {
            icon: "icons/crate.svg",
            scale: 0.8,
            anchor: [0.5, 0.5]
        },
        // Alternative marker styles
        tent: {
            icon: "icons/tent.png",
            scale: 0.8,
            anchor: [0.5, 0.5]
        },
        dryBag: {
            icon: "icons/dry_bag.svg",
            scale: 0.8,
            anchor: [0.5, 0.5]
        }
    },
    
    // Available maps (for future expansion)
    availableMaps: {
        chernarus: {
            name: "Chernarus",
            path: "assets/high_res_chernarus_sa_map.jpg",
            description: "A 225 km² post-soviet country featuring forests, cities, and mountains"
        }
        // Can add more maps here in the future
    }
};
