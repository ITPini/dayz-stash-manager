# DayZ Stash Manager

A web-based interactive map with stash management functionality. Currently only for DayZ's Chernarus map.

## Features

- High-resolution Chernarus map with zoom and pan functionality
- Add, move, and remove stash markers on the map
- Detailed inventory management system for each stash
- Item categories with customizable layouts
- Save and load your markers locally
- Export/import your markers to share with friends

## Usage

### Map Controls
- **Add Marker** (📍): Click to enter marker placement mode, then click on the map to place a marker
- **Clear Markers** (🗑️): Remove all markers from the map
- **Save Markers** (💾): Save all markers to local storage
- **Load Markers** (📂): Load markers from local storage
- **Export Markers** (📤): Export markers to a file for sharing
- **Import Markers** (📥): Import markers from a shared file

### Marker Management
- **Click** on a marker to open its inventory
- **Move**: Click the "Move" button and then click on a new location
- **Remove**: Click the "Remove" button to delete a marker
- **Rename**: Edit the text field at the top of the marker popup

### Inventory Management
- **Click** on an empty slot to open the item selector
- **Click and move** items to move them between slots
- **Press R** to rotate items while moving them
- **Right-click** on an item to remove it
- **Ctrl+Click** (or Cmd+Click on Mac) on an item to remove it

## Development

This project is built with vanilla JavaScript and uses:
- OpenLayers for map rendering
- Custom-built inventory management system
- Local Storage for data persistence

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is open source and available under the MIT License.
