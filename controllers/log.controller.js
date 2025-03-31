import pool from '../config/db.js';

// Function to log dashboard visits
export const logVisit = async (req, res) => {
    try {
        const { coordinates } = req.body;
        const user_id = req.user.user_id;

        // Insert log entry into database
        const query = `
            INSERT INTO Logs (user_id, coordinates) 
            VALUES ($1, $2) 
            RETURNING *;
        `;

        const result = await pool.query(query, [user_id, coordinates]);
        res.status(201).json({ status: true, message: "Visit logged", data: result.rows[0] });
    } catch (err) {
        console.error("Error logging visit:", err);
        res.status(500).json({ status: false, message: "Error logging visit" });
    }
};
