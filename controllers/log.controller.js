import pool from '../config/db.js';

// Function to log dashboard visits
export const logVisit = async (req, res) => {
    try {
        const { user_id, coordinates } = req.body;
        // const user_id = req.user.user_id
        const re = await pool.query('SELECT COUNT(*) FROM logs');
            const count = parseInt(re.rows[0].count, 10); // Extract count from result
            const log_id = `L-${count + 1}`;
        // Insert log entry into database
        const query = `
            INSERT INTO Logs (log_id, user_id, coordinates) 
            VALUES ($1, $2, $3) 
            RETURNING *;
        `;

        const result = await pool.query(query, [log_id, user_id, coordinates]);
        res.status(201).json({ status: true, message: "Visit logged", data: result.rows[0] });
    } catch (err) {
        console.error("Error logging visit:", err);
        res.status(500).json({ status: false, message: "Error logging visit" });
    }
};
