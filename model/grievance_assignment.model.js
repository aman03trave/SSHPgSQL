import pool from "../config/db.js";

pool.connect()

.then(() =>
{
    try {
        console.log("Connected to the database");
        pool.query(`CREATE TABLE grievance_assignment (
                    grievance_id VARCHAR(30) REFERENCES grievances(grievance_id) ON DELETE CASCADE,
                    assigned_by VARCHAR(30) REFERENCES users(user_id),
                    assigned_to VARCHAR(30) REFERENCES users(user_id),
                    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY(grievance_id, assigned_to)
                );
                `)
    } catch (error) {
        throw (error);
    }
}
)
.then(() => console.log("Table created succesfully"))

.finally(() => {
    pool.end();
    console.log("Connection closed.");
})