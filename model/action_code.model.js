import pool from '../config.db.js';

pool
  .connect()
  .then(() => {

    console.log('Connected to the database');
    pool.query(`CREATE TABLE IF NOT EXISTS Action_Code(
        action_code_id SERIAL PRIMARY KEY,
        code VARCHAR(20) NOT NULL UNIQUE,
    )`);
  })