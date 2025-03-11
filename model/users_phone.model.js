import pool from '../config/db.js';

pool
  .connect()
  .then(() => {
    console.log("Connected to the database");
    return pool.query(`CREATE TABLE IF NOT EXISTS Users_Phone(
        user_phone_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
        phone_number VARCHAR(20) NOT NULL);`);
  })
  .then(() => {
    console.log("Users_Phone table created");
  })
  .catch((err) => {
    console.error("Error creating Users_Phone table", err);
    throw err;
  })
  .finally(() => {
    pool.end();
    console.log("Connection closed.");
  });