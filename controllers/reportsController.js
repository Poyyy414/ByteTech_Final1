const pool = require('../config/database');

// Example conversion function (replace factor with your real conversion)
const convertToTons = (co2_density) => co2_density * 0.001; // 1 unit = 0.001 tons

// Get Monthly Report
exports.getMonthlyReport = async (req, res) => {
    try {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1); // 1st day of current month
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1); // 1st day of next month

        // 1️⃣ Current Month Total
        const [currentRows] = await pool.query(`
            SELECT co2_density
            FROM sensor_data
            WHERE recorded_at >= ? AND recorded_at < ?
        `, [startDate, endDate]);

        const currentTotal = currentRows.reduce((sum, row) => sum + convertToTons(row.co2_density), 0);

        // 2️⃣ Previous Month Total
        const prevStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const prevEnd = startDate;

        const [previousRows] = await pool.query(`
            SELECT co2_density
            FROM sensor_data
            WHERE recorded_at >= ? AND recorded_at < ?
        `, [prevStart, prevEnd]);

        const previousTotal = previousRows.reduce((sum, row) => sum + convertToTons(row.co2_density), 0);

        // 3️⃣ Barangay Breakdown (Current Month)
        const [breakdownRows] = await pool.query(`
            SELECT barangay_name, SUM(co2_density) AS total
            FROM sensor_data
            WHERE recorded_at >= ? AND recorded_at < ?
            GROUP BY barangay_name
        `, [startDate, endDate]);

        const formattedBreakdown = breakdownRows.map(item => ({
            barangay_name: item.barangay_name,
            total: convertToTons(item.total),
            percentage: currentTotal > 0 ? ((convertToTons(item.total) / currentTotal) * 100).toFixed(2) : 0
        }));

        res.json({
            totalEmission: currentTotal,
            previousTotalEmission: previousTotal,
            breakdown: formattedBreakdown
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch monthly report' });
    }
};

// Get Weekly Report
exports.getWeeklyReport = async (req, res) => {
    try {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay()); // start of current week (Sunday)
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7); // end of week

        // 1️⃣ Current Week Total
        const [currentRows] = await pool.query(`
            SELECT co2_density
            FROM sensor_data
            WHERE recorded_at >= ? AND recorded_at < ?
        `, [startDate, endDate]);

        const currentTotal = currentRows.reduce((sum, row) => sum + convertToTons(row.co2_density), 0);

        // 2️⃣ Previous Week Total
        const prevStart = new Date(startDate);
        prevStart.setDate(startDate.getDate() - 7);

        const prevEnd = startDate;

        const [previousRows] = await pool.query(`
            SELECT co2_density
            FROM sensor_data
            WHERE recorded_at >= ? AND recorded_at < ?
        `, [prevStart, prevEnd]);

        const previousTotal = previousRows.reduce((sum, row) => sum + convertToTons(row.co2_density), 0);

        // 3️⃣ Barangay Breakdown (Current Week)
        const [breakdownRows] = await pool.query(`
            SELECT barangay_name, SUM(co2_density) AS total
            FROM sensor_data
            WHERE recorded_at >= ? AND recorded_at < ?
            GROUP BY barangay_name
        `, [startDate, endDate]);

        const formattedBreakdown = breakdownRows.map(item => ({
            barangay_name: item.barangay_name,
            total: convertToTons(item.total),
            percentage: currentTotal > 0 ? ((convertToTons(item.total) / currentTotal) * 100).toFixed(2) : 0
        }));

        res.json({
            totalEmission: currentTotal,
            previousTotalEmission: previousTotal,
            breakdown: formattedBreakdown
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch weekly report' });
    }
};
