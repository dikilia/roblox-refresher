// server.js
const express = require('express');
const path = require('path');
const refreshHandler = require('./api/refresh');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API Routes - directly using the same handler
app.post('/api/refresh', async (req, res) => {
    // Create a mock event object
    const mockReq = {
        method: req.method,
        body: req.body,
        headers: req.headers
    };
    
    const mockRes = {
        setHeader: (...args) => res.setHeader(...args),
        status: (code) => {
            res.status(code);
            return mockRes;
        },
        json: (data) => res.json(data),
        end: () => res.end()
    };
    
    await refreshHandler(mockReq, mockRes);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api/refresh`);
});
