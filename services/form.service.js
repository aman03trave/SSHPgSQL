import pool from '../config/db.js';

class Forms{
    async getDistricts(){
        const result = await pool.query('SELECT district_name FROM Districts');
        return result.rows;
    }
    async getBlocks(district_id){
        console.log(district_id);
        const result = await pool.query('SELECT * FROM Blocks WHERE district_id = $1', [district_id]);
        return result.rows;
    }
    async getSchools(block_id){
        const result = await pool.query('SELECT * FROM School WHERE block_id = $1', [block_id]);
        return result.rows;
    }

}

export default Forms;