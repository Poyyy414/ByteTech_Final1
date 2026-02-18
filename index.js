const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser'); // make sure you install this: npm install body-parser

// Create Express app
const app = express();

// ========================
// Middleware
// ========================
app.use(cors());
app.use(bodyParser.json()); // or app.use(express.json());

// ========================
// Routes
// ========================
const sensorDataRoutes = require('./routes/sensorDataRoutes'); // adjust path if needed
app.use('/', sensorDataRoutes);

// ========================
// 404 Fallback
// ========================
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: `Route ${req.method} ${req.url} not found` 
    });
});

// ========================
// Start server
// ========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);  
});
