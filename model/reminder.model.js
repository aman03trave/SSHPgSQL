import pool from '../config/db.js';

pool
.connect()
.then(() => {
    console.log("Connceted to the database");
    pool .query(`CREATE TABLE IF NOT EXISTS Reminders (
    reminder_id SERIAL PRIMARY KEY,
    grievance_id VARCHAR(30) REFERENCES Grievances(grievance_id) ON DELETE CASCADE,
    user_id VARCHAR(30) REFERENCES Users(user_id) ON DELETE CASCADE,
    reminder_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    viewed BOOLEAN DEFAULT FALSE
    
);`)
})

 .then(() => {
    console.log("Reminders table created");
})
.catch((err) => {
    console.error("Error creating Reminders table", err);
})
.finally(() => {
    pool.end();
    console.log("Connection closed");
});