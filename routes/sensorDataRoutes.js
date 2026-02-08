const express = require('express');
const router = express.Router();

const sensorDataController = require('../controllers/sensorDataController');

// POST sensor data
router.post('/', sensorDataController.createSensorData);

// GET sensor data
router.get('/', sensorDataController.getAllSensorData);

module.exports = router;
