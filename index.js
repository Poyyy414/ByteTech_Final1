const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ========================
// MySQL connection
// ========================
const db = mysql.createConnection({
    host: 'mysql-360d30a7-gbox-6009.a.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_xRg_1Ymj9oje4V_wSeq',
    database: 'defaultdb',
    port: 11105
});

db.connect(err => {
    if (err) {
        console.error('DB Connection Error:', err);
    } else {
        console.log('✅ MySQL Connected');
    }
});

// ========================
// POST: Insert sensor data
// ========================
app.post('/create/sensor-data', (req, res) => {
    const {
        sensor_id,
        co2_density,
        temperature_c,
        humidity,
        heat_index_c,
        carbon_level
    } = req.body;

  if (
    typeof sensor_id === 'undefined' ||
    typeof temperature_c === 'undefined' ||
    typeof co2_density === 'undefined'
) {
    return res.status(400).json({ error: 'Missing required fields' });
}


    const sql = `
        INSERT INTO sensor_data
        (sensor_id, co2_density, temperature_c, humidity, heat_index_c, carbon_level)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        sensor_id,
        co2_density,
        temperature_c,
        humidity,
        heat_index_c,
        carbon_level
    ], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({
            success: true,
            data_id: result.insertId
        });
    });
});

// ========================
// GET: Latest sensor data for a sensor
// ========================
app.get('/sensor-data', (req, res) => {
    const { sensor_id } = req.params;

    if (!sensor_id) return res.status(400).json({ error: 'sensor_id is required' });

    const sql = `
        SELECT *
        FROM sensor_data
        WHERE sensor_id = ?
        ORDER BY recorded_at DESC
        LIMIT 1
    `;

    db.query(sql, [sensor_id], (err, results) => {
        if (err) {
            console.error('DB Query Error:', err);
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        if (results.length === 0) return res.status(404).json({ message: 'No data found for this sensor' });
        res.json(results[0]);
    });
});

// ========================
// Start server
// ========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server running on port ${PORT}');
});