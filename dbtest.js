import pool from './config/db.js';

async function testDB() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connected to DB:', res.rows[0]);
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

testDB();
