import pool from '../config/db.js'

pool
  .connect()
  .then(() => {
    console.log("Connected to the database");
    return pool.query(`CREATE TABLE IF NOT EXISTS Identity_Proof(
        identity_proof_id VARCHAR(10) PRIMARY KEY,
        proof_type VARCHAR(30) NOT NULL UNIQUE
    )`)
  })

  .then(() => {
    console.log("Identity Proof table created");
  })
  .catch((err) => {
    console.error("Error creating Identity Proof table", err);
    throw err;
  })
  .finally(() => {
    pool.end();
    console.log("Connection closed");
  });