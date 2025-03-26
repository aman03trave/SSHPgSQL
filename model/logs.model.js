import pool from '../config/db.js';

pool
.connect()
.then(() => {
    console.log("Connected to the database");

    pool.query(`CREATE TABLE IF NOT EXISTS Logs(
        log_id VARCHAR(30) PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id VARCHAR(30) REFERENCES Users(user_id),
        coordinates VARCHAR(50)
    )`);
})
.then(() => {
    console.log("Logs table created");
})
.catch((err) => {
    console.error("Error creating Logs table", err);
})
.finally(() => {
    pool.end();
    console.log("Connection closed");
});