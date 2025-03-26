import pool from '../config/db.js';

pool
  .connect()
  .then(() => {
    console.log("Connected to the database.");
    return pool.query(`CREATE TABLE IF NOT EXISTS Users_Identity(
        user_identity_proof_id SERIAL PRIMARY KEY,
        user_id VARCHAR(30) REFERENCES Users(user_id) ON DELETE CASCADE,
        identity_proof_id VARCHAR(10) REFERENCES Identity_Proof(identity_proof_id),
        identity_proof_number VARCHAR(50) NOT NULL)`)
  })
  .then(() => {
    console.log("Users_Identity table created.");
  })
  .catch((err) => {
    console.error("Error creating Users_Identity table.", err);
    throw err;
  })
  .finally(() => {
    pool.end();
    console.log("Connection closed.");
  });