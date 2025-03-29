import pool from '../config/db.js'

class Grievances{
    
    //add action
    async addAction(grievance_id, user_id, action_code_id){
        try {
                const result = await pool.query(`INSERT INTO ACTION_LOG(grievance_id, user_id, action_code_id) VALUES($1, $2, $3)`, [grievance_id, user_id, action_code_id]);
                return result.rows[0];
            } catch (error) {
                throw new Error(`Error adding action : '${error}' `);
            }
        } catch (error) {
            throw new Error(`Error adding action : '${error}' `);
    
    }

    //add grievance function
    async addGrievance(user_id, complainant_id, grievance_category_id, title, description, block_id, school_id, district_id){
        try {
            const re = await pool.query('SELECT COUNT(*) FROM complainants');
            const count = parseInt(re.rows[0].count, 10); // Extract count from result
            const grievance_id = `G-${1000 + count + 1}`;

            console.log(user_id, complainant_id, grievance_category_id, title, description, block_id, school_id, district_id);
            const result = await pool.query(`INSERT INTO Grievances(grievance_id, complainant_id, grievance_category_id, title, description, district_id, block_id, school_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`, 
                [grievance_id, complainant_id, grievance_category_id, title, description, district_id, block_id, school_id]);
            
            //add Action
            await this.addAction(grievance_id, user_id, 1, );
            // return result.rows[0];
        } catch (error) {
            throw new Error(`Error lodging grievance : '${error}' `);
        }
    }
// get complainant id
    async getComplainant(user_id){
        try {
            const result = await pool.query('SELECT complainant_id FROM Complainants WHERE user_id = $1', [user_id]);
            return result.rows[0].complainant_id;
            
        } catch (error) {
            throw new Error(`Error getting user : '${user_id, error}'`)
        }
    }

    // get block id
    async getBlock(block_id){
        try {
            const result = await pool.query('SELECT block_id FROM Blocks WHERE block_name = $1', [block_id]);
            return result.rows[0].block_id;
            
        } catch (error) {
            throw new Error(`Error getting block : '${block_id, error}'`)
        }
    }

    //get school id
    async getSchool(school_id){
        try {
            const result = await pool.query('SELECT school_id FROM School WHERE school_name = $1', [school_id]);
            return result.rows[0].school_id;
            
        } catch (error) {
            throw new Error(`Error getting school : '${school_id, error}'`)
        }
    }

    //get district id
    async getDistrict(district_id){
        try {
            const result = await pool.query('SELECT district_id FROM Districts WHERE district_name = $1', [district_id]);
            return result.rows[0].district_id;
            
        } catch (error) {
            throw new Error(`Error getting district : '${district_id, error}'`)
        }
    }

    //get grievance category id
    async getgrievance_category(grievance_category){
        try {
            const result = await pool.query('SELECT * FROM grievance_category WHERE grievance_category_name = $1 ', [grievance_category]);
            return result.rows[0].grievance_category_id;
            
        } catch (error) {
            throw new Error(`Error getting grievances : '${grievance_category, error}'`)
        }
    }
}

export default Grievances;