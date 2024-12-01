const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const satelliteData = {
    id: 'sat-001',
    timestamp: Date.now(),
    position: { lat: 34.5, lon: 128.9, alt: 400 }
};

wss.on('connection', (ws) => {
    console.log('Client connected');
    const interval = setInterval(() => {
        satelliteData.position = {
            lat: satelliteData.position.lat,
            lon:satelliteData.position.lon + 0.3,
            alt: satelliteData.position.alt + 0.8
        }
        ws.send(JSON.stringify(satelliteData));
    }, 100);

    ws.on('close', () => {
        clearInterval(interval);
        console.log('Client disconnected');
    });
});

app.use(express.static('frontend'));

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
