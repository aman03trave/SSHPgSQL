import pool from '../config/db.js';

pool
  .connect()
  .then(() => {
    console.log("Connected to the database");
    return pool.query(`CREATE TABLE IF NOT EXISTS Complainant_Category(
        complainant_category_id SERIAL PRIMARY KEY,
        category_name VARCHAR(50) NOT NULL
    );`);
  })
  .then(() => {
    console.log("Complainant_Category table created.");
  })
  .catch((err) => {
    console.error("Error creating Complainant_Category table", err);
    throw err;
  })
  .finally(() => {
    pool.end();
    console.log("Connection closed.");
  });