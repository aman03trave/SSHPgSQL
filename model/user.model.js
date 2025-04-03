import pg from "pg";
import db from "../config/db.js";

// console.log("DB Config:", db); // Debugging Step

const pool = db;

pool
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL");
    return pool.query(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id VARCHAR(30) PRIMARY KEY,
        name VARCHAR(30),
        gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
        age INT CHECK(age > 0) NOT NULL,
        email VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role_id INT REFERENCES Roles(role_id),
        phone_no VARCHAR(20) NOT NULL
      );
    `);
  })
  .then(() => {
    console.log("Table created");
  })
  .catch((err) => {
    console.error("Error creating table", err);
  })
  .finally(() => {
    pool.end();
  })
  .catch((err) => {
    console.error("Error connecting to PostgreSQL", err);
  });
