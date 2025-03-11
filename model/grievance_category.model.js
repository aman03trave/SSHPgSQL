import pool from '../config/db.js';

pool
  .connect()
  .then(() => {
    console.log("Connected to database");
    return pool.query(`CREATE TABLE IF NOT EXISTS Grievance_Category(
        grievance_category_id SERIAL PRIMARY KEY,
        grievance_category_name VARCHAR(50) NOT NULL);`);
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.error("Error connectinggin to database", err);

  })
  .finally(() => pool.end());