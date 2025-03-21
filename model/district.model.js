import pool from '../config/db.js'

pool
  .connect()
  .then(() => {
    console.log("Connected to the database");
    return pool.query(`CREATE TABLE IF NOT EXISTS Districts(
        district_id VARCHAR(10) PRIMARY KEY,
        district_name VARCHAR(20) NOT NULL);`);
  })
  .then(() => {
    console.log("Districts table created");
  })
  .catch((err) => {
    console.error("Error creating DIstrict table", err);
    throw err;
  })
  .finally(() => {
    pool.end();
  });