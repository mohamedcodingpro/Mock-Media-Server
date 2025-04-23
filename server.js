const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const fileHandler = require('./utils/fileHandler');

const PORT = 3000;

// Initialize data storage
fileHandler.initialize();

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    let body = '';

    req.on('data', chunk => body += chunk.toString());
    
    req.on('end', () => {
        res.setHeader('Content-Type', 'application/json');

        // Serve API documentation
        if (pathname === '/') {
            return serveStaticFile(res, './public/index.html', 'text/html');
        }

        // Serve media files (Bonus)
        if (pathname.startsWith('/media/')) {
            return serveStaticFile(res, `./public${pathname}`, getContentType(pathname));
        }

        // API Endpoints
        if (pathname === '/movies' || pathname === '/series' || pathname === '/songs') {
            return handleMediaEndpoint(req, res, pathname, body);
        }

        // Handle 404
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Endpoint not found' }));
    });
});

// Handle media endpoints (movies, series, songs)
function handleMediaEndpoint(req, res, pathname, body) {
    const mediaType = pathname.slice(1); // Remove leading slash
    const data = fileHandler.getAllMedia().filter(item => item.type === mediaType);

    if (req.method === 'GET') {
        res.end(JSON.stringify(data));
    } 
    else if (req.method === 'POST') {
        try {
            const newItem = JSON.parse(body);
            newItem.type = mediaType;
            const addedItem = fileHandler.addMedia(newItem);
            res.statusCode = 201;
            res.end(JSON.stringify(addedItem));
        } catch (err) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON data' }));
        }
    }
    else if (req.method === 'PUT') {
        try {
            const updateItem = JSON.parse(body);
            updateItem.type = mediaType;
            const allMedia = fileHandler.getAllMedia();
            const index = allMedia.findIndex(i => i.id === updateItem.id && i.type === mediaType);
            
            if (index === -1) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Item not found' }));
            } else {
                allMedia[index] = updateItem;
                fileHandler.writeData({ media: allMedia });
                res.end(JSON.stringify(updateItem));
            }
        } catch (err) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON data' }));
        }
    }
    else if (req.method === 'DELETE') {
        try {
            const { id } = JSON.parse(body);
            const allMedia = fileHandler.getAllMedia();
            const filtered = allMedia.filter(item => !(item.id === id && item.type === mediaType));
            
            fileHandler.writeData({ media: filtered });
            res.end(JSON.stringify(filtered.filter(item => item.type === mediaType)));
        } catch (err) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON data' }));
        }
    }
    else {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
}

// Helper function to serve static files
function serveStaticFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.statusCode = err.code === 'ENOENT' ? 404 : 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
                error: err.code === 'ENOENT' ? 'File not found' : 'Server error' 
            }));
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

// Helper function to get content type
function getContentType(filePath) {
    const extname = path.extname(filePath);
    const types = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg'
    };
    return types[extname] || 'application/octet-stream';
}

server.listen(PORT, () => {
    console.log(`Media server running at http://localhost:${PORT}`);
});