import pool from "../config/db.js";

pool
.connect()
.then(() => {
    try {
        console.log("Connected to database");

        pool.query(`CREATE TABLE officer_info (
                    officer_id VARCHAR(30) PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
                    district_id VARCHAR(10),
                    block_id VARCHAR(10)
                );
                `)
    } catch (error) {
        throw new Error(error);
    }
}

)
.then(() => console.log("Table created successfully"))
.finally(() => {
    pool.end();
    console.log("Connection closed");
})