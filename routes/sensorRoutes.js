const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');


router.post('/', sensorController.createSensor); //sensor

// Get all sensors (with resolved location)
router.get('/', sensorController.getAllSensors); //sensor

// Get single sensor by ID
router.get('/:id', sensorController.getSensorById); //sensor/1

// Update sensor
router.put('/:id', sensorController.updateSensor); //sensor/1

// Delete sensor
router.delete('/:id', sensorController.deleteSensor); //sensor/1

// ================================
// SENSOR DATA
// ================================

// Get sensor readings
router.get('/:id/data', sensorController.getSensorData);

module.exports = router;