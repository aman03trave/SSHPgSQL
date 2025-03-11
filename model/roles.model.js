import pool from '../config/db.js'

pool
.connect()
.then(() => {
    console.log("Connected to the Database");
    return pool.query(`CREATE TABLE IF NOT EXISTS Roles(
        role_id SERIAL PRIMARY KEY,
        role_name VARCHAR(30) NOT NULL UNIQUE
    )`);
})
.then(() => {
    console.log("Roles table created");
})
.catch((err) => {
    console.error("Error creating roles table", err);
});