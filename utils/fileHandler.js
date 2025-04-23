const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/media.json');
const mediaDir = path.join(__dirname, '../public/media');

// Initialize data storage
function initialize() {
    try {
        // Create directories if they don't exist
        if (!fs.existsSync(path.dirname(dataPath))) {
            fs.mkdirSync(path.dirname(dataPath), { recursive: true });
        }
        if (!fs.existsSync(mediaDir)) {
            fs.mkdirSync(mediaDir, { recursive: true });
        }

        // Create data file with default content if it doesn't exist
        if (!fs.existsSync(dataPath)) {
            const defaultData = {
                media: [
                    { id: 1, type: "movies", title: "Inception", director: "Christopher Nolan", year: 2010 },
                    { id: 2, type: "movies", title: "Black Panther", director: "Ryan Coogler", year: 2018 },
                    { id: 3, type: "series", title: "Breaking Bad", seasons: 5 },
                    { id: 4, type: "series", title: "Stranger Things", seasons: 4 },
                    { id: 5, type: "songs", title: "Blinding Lights", artist: "The Weeknd" },
                    { id: 6, type: "songs", title: "Shape of You", artist: "Ed Sheeran" }
                ]
            };
            fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2));
        }
    } catch (err) {
        console.error('Initialization error:', err);
    }
}

// Read all media items
function getAllMedia() {
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data).media;
    } catch (err) {
        console.error('Error reading media data:', err);
        return [];
    }
}

// Add new media item
function addMedia(mediaItem) {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        mediaItem.id = data.media.length > 0 ? Math.max(...data.media.map(m => m.id)) + 1 : 1;
        mediaItem.createdAt = new Date().toISOString();
        data.media.push(mediaItem);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return mediaItem;
    } catch (err) {
        console.error('Error adding media:', err);
        return null;
    }
}

// Write data to file
function writeData(data) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error('Error writing data:', err);
        return false;
    }
}

module.exports = {
    initialize,
    getAllMedia,
    addMedia,
    writeData
};