import pool from'../config/db.js'

pool
  .connect()
  .then(() => {
    console.log("Connected to the database");
    return pool.query(`CREATE TABLE IF NOT EXISTS BLocks(
        block_id SERIAl PRIMARY KEY,
        block_name VARCHAR(20) NOT NULL,
        district_id VARCHAR(20) REFERENCES Districts(district_id));`);

  })
  .then(()=> {
    console.log("Blocks table created");
  })
  .catch((err) => {
    console.error("Error creating Blocks table", err);
    throw err;
  })
  .finally(() =>{pool.end();
    console.log("Connection closed");
  });