import pool from '../config/db.js'

pool
.connect()
.then(() => {
    try {
        console.log("Connected to the database");

        pool.query(`CREATE TABLE atr_review (
                    atr_review_id SERIAL PRIMARY KEY,
                    atr_id VARCHAR(30) REFERENCES Grievances(grievance_id) ON DELETE CASCADE,
                    reviewed_by VARCHAR(30) REFERENCES users(user_id),
                    status VARCHAR(20) CHECK (status IN ('accepted', 'rejected')),
                    remarks TEXT,
                    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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