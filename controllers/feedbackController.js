const pool = require('../config/database');

// CREATE feedback
exports.createFeedback = async (req, res) => {
    try {
        const { name, feedback_type, rating, message } = req.body;

        // Validate required fields
        if (!feedback_type || !rating || !message) {
            return res.status(400).json({
                success: false,
                message: 'feedback_type, rating, and message are required',
                required: ['feedback_type', 'rating', 'message'],
                optional: ['name']
            });
        }

        // Validate feedback_type
        const validTypes = ['Report a Bug', 'Improvement', 'General Feedback', 'Others'];
        if (!validTypes.includes(feedback_type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid feedback_type',
                valid_options: validTypes
            });
        }

        // Validate rating (1-5)
        const parsedRating = parseInt(rating);
        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be a number between 1 and 5'
            });
        }

        // Validate message not empty
        if (message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Message cannot be empty'
            });
        }

        const sql = `
            INSERT INTO feedback (name, feedback_type, rating, message)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await pool.execute(sql, [
            name || null,        // optional — null if not provided
            feedback_type,
            parsedRating,
            message.trim()
        ]);

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            feedback_id: result.insertId
        });

    } catch (error) {
        console.error('Create Feedback Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// GET all feedback
exports.getAllFeedback = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM feedback ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            total: rows.length,
            data: rows
        });

    } catch (error) {
        console.error('Get All Feedback Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// GET single feedback by ID
exports.getFeedbackById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.execute(
            'SELECT * FROM feedback WHERE feedback_id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Feedback with ID "${id}" not found`
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error('Get Feedback By ID Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// GET feedback by type
exports.getFeedbackByType = async (req, res) => {
    try {
        const { type } = req.params;

        const validTypes = ['Report a Bug', 'Improvement', 'General Feedback', 'Others'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid feedback_type',
                valid_options: validTypes
            });
        }

        const [rows] = await pool.execute(
            'SELECT * FROM feedback WHERE feedback_type = ? ORDER BY created_at DESC',
            [type]
        );

        res.json({
            success: true,
            feedback_type: type,
            total: rows.length,
            data: rows
        });

    } catch (error) {
        console.error('Get Feedback By Type Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// GET feedback summary (average rating + count per type)
exports.getFeedbackSummary = async (req, res) => {
    try {
        const [summary] = await pool.query(`
            SELECT 
                feedback_type,
                COUNT(*)            AS total,
                ROUND(AVG(rating), 1) AS average_rating,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS four_star,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS three_star,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS two_star,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS one_star
            FROM feedback
            GROUP BY feedback_type
            ORDER BY feedback_type
        `);

        const [overall] = await pool.query(`
            SELECT 
                COUNT(*)              AS total_feedback,
                ROUND(AVG(rating), 1) AS overall_rating
            FROM feedback
        `);

        res.json({
            success: true,
            overall: overall[0],
            by_type: summary
        });

    } catch (error) {
        console.error('Get Feedback Summary Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// DELETE feedback by ID
exports.deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;

        const [check] = await pool.execute(
            'SELECT feedback_id FROM feedback WHERE feedback_id = ?',
            [id]
        );

        if (check.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Feedback with ID "${id}" not found`
            });
        }

        await pool.execute('DELETE FROM feedback WHERE feedback_id = ?', [id]);

        res.json({
            success: true,
            message: `Feedback ID "${id}" deleted successfully`
        });

    } catch (error) {
        console.error('Delete Feedback Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};