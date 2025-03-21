import pool from '../config/db.js';

pool
  .connect()
  .then(() => {
    console.log("Connecting to database");
    return pool.query(`CREATE TABLE IF NOT EXISTS Grievances(
        grievance_id SERIAL PRIMARY KEY,
        complainant_id INT REFERENCES Complainants(complainant_id),
        grievance_category_id INT REFERENCES Grievance_Category(grievance_category_id) ON DELETE SET NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        district_id VARCHAR(20) REFERENCES Districts(district_id) ON DELETE SET NULL,
        block_id INT REFERENCES Blocks(block_id) ON DELETE SET NULL,
        school_id INT REFERENCES School(school_id) ON DELETE SET NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  })
  .then(() => {
    console.log("Grievances table created");
  })
  .catch((err) => {
    console.error("Error creating Grievances table", err);
    throw err;
  })
  .finally(() => {
    pool.end();
    console.log("Connection closed");
  });