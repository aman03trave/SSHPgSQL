import pool from '../config/db.js';

pool
  .connect()
  .then(() => {
    console.log('Connected to database');
    return pool.query(`CREATE TABLE IF NOT EXISTS School(
        school_id SERIAL PRIMARY KEY,
        school_name VARCHAR(50) NOT NULL,
        district_id VARCHAR(20) REFERENCES Districts(district_id),
        block_id INT REFERENCES Blocks(block_id)
    )`);
  })
  .then(() => {
    console.log('School table created');
  })
  .catch((err) => {
    console.error('Error creating School table', err);
    throw err;
  })
  .finally(() => {
    pool.end();
    console.log('Connection closed');
  });