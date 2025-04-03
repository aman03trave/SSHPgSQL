import fs from 'fs';
import csv from 'csv-parser'
import pool from './config/db.js'


pool.connect();

async function insertCSVData(csvFilePath) {
  const records = [];

  // Read CSV file
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      records.push([
        row.school_id,
        row.school_name,
        row.district_id,
        row.block_id,
      ]);
    })
    .on('end', async () => {
      console.log('CSV file successfully processed');

      const query = `
        INSERT INTO school (school_id, school_name, district_id, block_id) 
        VALUES ($1, $2, $3, $4)
      `;

      try {
        for (let record of records) {
          await pool.query(query, record);
        }
        console.log('Data inserted successfully');
      } catch (err) {
        console.error('Error inserting data:', err);
      } finally {
        pool.end();
      }
    });
}

// Call function with the CSV file path
insertCSVData('data-1743671282608.csv')