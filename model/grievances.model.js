import pool from '../config/db.js';

pool
  .connect()
  .then(() => {
    console.log("Connecting to database");
    return pool.query(`CREATE TABLE IF NOT EXISTS Grievances(
        grievance_id SERIAL PRIMARY KEY,
        complainant_id INT REFERENCES Complainants(complainant_id),
        complaint_type_id INT REFERENCES ComplaintTypes(complaint_type_id) ON DELETE SET NULL,
        description TEXT NOT NULL,
        school_id INT REFERENCES Schools(school_id) ON DELETE SET NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  })