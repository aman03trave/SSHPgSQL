import pool from '../config/db.js'

pool
  .connect()
  .then(() => {
    console.log("Connected to the database");
    return pool.query(`CREATE TABLE IF NOT EXISTS Complainants(
        complainant_category_id SERIAL PRIMARY KEY,
        user_id INT REFERENCE Users(user_id) On DELETE CASCADE.
        category_id INT REFERENCE Complainant_Category(complainant_category_id));`);
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