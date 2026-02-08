const pool = require('../config/database');

// CREATE sensor data
exports.createSensorData = async (req, res) => {
    try {
        const { sensor_id, temperature, humidity, carbon_level } = req.body;

        if (!sensor_id) {
            return res.status(400).json({ message: 'sensor_id is required' });
        }

        const sql = `
            INSERT INTO sensor_data 
            (sensor_id, temperature, humidity, carbon_level)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await pool.execute(sql, [
            sensor_id,
            temperature,
            humidity,
            carbon_level
        ]);

        res.status(201).json({
            message: 'Sensor data saved',
            data_id: result.insertId
        });

    } catch (error) {
        console.error('SensorData Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET all sensor data
exports.getAllSensorData = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM sensor_data ORDER BY created_at DESC'
        );

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
