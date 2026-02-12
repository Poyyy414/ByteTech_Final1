const pool = require('../config/database');

/* =====================================================
   📅 MONTHLY REPORT
   GET /reports/monthly
   Optional: ?month=12&year=2026
===================================================== */
exports.getMonthlyReport = async (req, res) => {
    try {
        let { month, year } = req.query;

        const now = new Date();
        month = month || (now.getMonth() + 1);
        year = year || now.getFullYear();

        month = String(month).padStart(2, '0');

        const startDate = `${year}-${month}-01`;

        const [endResult] = await pool.query(
            `SELECT DATE_ADD(?, INTERVAL 1 MONTH) AS endDate`,
            [startDate]
        );

        const endDate = endResult[0].endDate;

        // 1️⃣ Current Month Total
        const [current] = await pool.query(`
            SELECT IFNULL(SUM(co2_density), 0) AS total
            FROM sensor_data
            WHERE recorded_at >= ?
            AND recorded_at < ?
        `, [startDate, endDate]);

        const currentTotal = current[0].total;

        // 2️⃣ Previous Month Total
        const [previous] = await pool.query(`
            SELECT IFNULL(SUM(co2_density), 0) AS total
            FROM sensor_data
            WHERE recorded_at >= DATE_SUB(?, INTERVAL 1 MONTH)
            AND recorded_at < ?
        `, [startDate, startDate]);

        const previousTotal = previous[0].total;

        let percentChange = 0;
        if (previousTotal > 0) {
            percentChange = ((currentTotal - previousTotal) / previousTotal) * 100;
        }

        // 3️⃣ Barangay Breakdown
        const [breakdown] = await pool.query(`
            SELECT 
                b.barangay_name,
                IFNULL(SUM(sd.co2_density), 0) AS total
            FROM sensor_data sd
            JOIN sensor s ON sd.sensor_id = s.sensor_id
            JOIN barangay b ON s.barangay_id = b.barangay_id
            WHERE sd.recorded_at >= ?
            AND sd.recorded_at < ?
            GROUP BY b.barangay_id, b.barangay_name
            ORDER BY total DESC
        `, [startDate, endDate]);

        const formattedBreakdown = breakdown.map(item => ({
            barangay_name: item.barangay_name,
            total: item.total,
            percentage: currentTotal > 0
                ? ((item.total / currentTotal) * 100).toFixed(2)
                : 0
        }));

        // 4️⃣ Raw Sensor Data
        const [sensorData] = await pool.query(`
            SELECT 
                sd.data_id,
                sd.sensor_id,
                sd.co2_density,
                sd.recorded_at,
                b.barangay_name
            FROM sensor_data sd
            JOIN sensor s ON sd.sensor_id = s.sensor_id
            JOIN barangay b ON s.barangay_id = b.barangay_id
            WHERE sd.recorded_at >= ?
            AND sd.recorded_at < ?
            ORDER BY sd.recorded_at DESC
        `, [startDate, endDate]);

        res.json({
            type: "Monthly",
            period: `${year}-${month}`,
            totalEmission: currentTotal,
            previousEmission: previousTotal,
            percentChange: Number(percentChange.toFixed(2)),
            breakdown: formattedBreakdown,
            sensorData: sensorData
        });

    } catch (error) {
        console.error("Monthly Report Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


/* =====================================================
   📅 WEEKLY REPORT
   GET /reports/weekly
   Optional: ?week=50&year=2026
===================================================== */
exports.getWeeklyReport = async (req, res) => {
    try {
        let { week, year } = req.query;

        const now = new Date();
        year = year || now.getFullYear();

        // Get current ISO week if not provided
        const oneJan = new Date(now.getFullYear(), 0, 1);
        const currentWeek = Math.ceil((((now - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);

        week = week || currentWeek;

        // Get week start and end dates
        const [weekDates] = await pool.query(`
            SELECT 
                STR_TO_DATE(CONCAT(?, ' ', ?, ' 1'), '%X %V %w') AS startDate,
                DATE_ADD(STR_TO_DATE(CONCAT(?, ' ', ?, ' 1'), '%X %V %w'), INTERVAL 7 DAY) AS endDate
        `, [year, week, year, week]);

        const startDate = weekDates[0].startDate;
        const endDate = weekDates[0].endDate;

        // 1️⃣ Current Week Total
        const [current] = await pool.query(`
            SELECT IFNULL(SUM(co2_density), 0) AS total
            FROM sensor_data
            WHERE recorded_at >= ?
            AND recorded_at < ?
        `, [startDate, endDate]);

        const currentTotal = current[0].total;

        // 2️⃣ Previous Week Total
        const [previous] = await pool.query(`
            SELECT IFNULL(SUM(co2_density), 0) AS total
            FROM sensor_data
            WHERE recorded_at >= DATE_SUB(?, INTERVAL 7 DAY)
            AND recorded_at < ?
        `, [startDate, startDate]);

        const previousTotal = previous[0].total;

        let percentChange = 0;
        if (previousTotal > 0) {
            percentChange = ((currentTotal - previousTotal) / previousTotal) * 100;
        }

        // 3️⃣ Barangay Breakdown
        const [breakdown] = await pool.query(`
            SELECT 
                b.barangay_name,
                IFNULL(SUM(sd.co2_density), 0) AS total
            FROM sensor_data sd
            JOIN sensor s ON sd.sensor_id = s.sensor_id
            JOIN barangay b ON s.barangay_id = b.barangay_id
            WHERE sd.recorded_at >= ?
            AND sd.recorded_at < ?
            GROUP BY b.barangay_id, b.barangay_name
            ORDER BY total DESC
        `, [startDate, endDate]);

        const formattedBreakdown = breakdown.map(item => ({
            barangay_name: item.barangay_name,
            total: item.total,
            percentage: currentTotal > 0
                ? ((item.total / currentTotal) * 100).toFixed(2)
                : 0
        }));

        // 4️⃣ Raw Sensor Data
        const [sensorData] = await pool.query(`
            SELECT 
                sd.data_id,
                sd.sensor_id,
                sd.co2_density,
                sd.recorded_at,
                b.barangay_name
            FROM sensor_data sd
            JOIN sensor s ON sd.sensor_id = s.sensor_id
            JOIN barangay b ON s.barangay_id = b.barangay_id
            WHERE sd.recorded_at >= ?
            AND sd.recorded_at < ?
            ORDER BY sd.recorded_at DESC
        `, [startDate, endDate]);

        res.json({
            type: "Weekly",
            period: `Week ${week}, ${year}`,
            totalEmission: currentTotal,
            previousEmission: previousTotal,
            percentChange: Number(percentChange.toFixed(2)),
            breakdown: formattedBreakdown,
            sensorData: sensorData
        });

    } catch (error) {
        console.error("Weekly Report Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
