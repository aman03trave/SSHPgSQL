import pool from '../config/db.js'

pool
  .connect()
  .then(() => {
    console.log("Connected to the database");
    return pool.query(`CREATE TABLE IF NOT EXISTS Identity_Proof(
        identity_proof_id SERIAL PRIMARY KEY,
        proof_type VARCHAR(30) NOT NULL UNIQUE
    )`)
  })