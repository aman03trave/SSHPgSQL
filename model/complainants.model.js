import pool from '../config/db.js'

pool
  .connect()
  .then(() => {
    console.log("Connected to the database");
    return pool.query(`CREATE TABLE IF NOT EXISTS Complainants(
        complainant_id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(30) REFERENCES Users(user_id) On DELETE CASCADE,
        complainant_category_id INT REFERENCES Complainant_Category(complainant_category_id));`);
  })
  .then(() => {
    console.log("Complainants table created");
  })
  .catch((err) => {
    console.error("Error creating Complainants table", err);
    throw err;
  })
  .finally(() => {
    pool.end();
    console.log("Connection closed.");
  });