import pool from '../config/db.js'

pool
.connect()
.then(() => {
    try {
        console.log("Connected to the database");

        pool.query(`CREATE TABLE atr_reports (
                    atr_id SERIAL PRIMARY KEY,
                    grievance_id vARCHAR(30) REFERENCES grievances(grievance_id) ON DELETE CASCADE,
                    generated_by VARCHAR(30) REFERENCES users(user_id), -- Level 2 officer
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    version INTEGER DEFAULT 1
);
`)
    } catch (error) {
        throw (error);
    }
})
.then(() => console.log("Table careated successfully"))
.finally(() => {
    pool.end();
    console.log("Connection closed");
})