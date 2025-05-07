import pool from '../config/db.js';

pool
.connect()
.then(() => {
    console.log("Connected to the database ");

    pool.query(`CREATE TABLE IF NOT EXISTS Action_Log (
    action_id SERIAL PRIMARY KEY,
    grievance_id VARCHAR(30) REFERENCES Grievances(grievance_id) ON DELETE CASCADE,
    user_id VARCHAR(30) REFERENCES Users(user_id) ON DELETE SET NULL,
    action_code_id INT REFERENCES Action_Code(action_code_id) ON DELETE CASCADE,
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
})
.then(() => {
    console.log("Action Log table created");
})
.catch((err) => {
    console.error("Error creating Action Log table", err);
}) 
.finally(() => {
    pool.end();
    console.log("Connection closed");
});