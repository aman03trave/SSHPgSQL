import pool from '../config/db.js';

class Forms{
    async getDistricts(){
        try{
        const result = await pool.query('SELECT district_name FROM Districts');
        return result.rows;
        }catch(e){
            throw new Error(e);
        }
    }
    async getBlocks(district_id){
        // console.log(district_id);
        try{
        const result = await pool.query('SELECT * FROM Blocks WHERE district_id = $1', [district_id]);
        return result.rows;
        }catch(e){
            throw new Error(e);
        }
    }
    async getSchools(block_id){
        try{
        const result = await pool.query('SELECT * FROM School WHERE block_id = $1', [block_id]);
        return result.rows;
        }catch(e){
            throw new Error(e);
        }
    }

    async getgrievance_category(){
        try{
        const result = await pool.query('SELECT grievance_category_name FROM Grievance_category');
        return result.rows;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    
    async getComplainant_Category(){
        try {
            const result = await pool.query('SELECT category_name FROM Complainant_Category');
            return result.rows;
            
        } catch (error) {
            throw new Error(error);
        }
    }

    async getIdentity_Proof(){
        try {
            const result = await pool.query('SELECT proof_type FROM Identity_Proof');
            return result.rows;
            
        } catch (error) {
            throw new Error(error);
        }
    }

    async getUser_Profile(user_id){
        try {
            const query = `
            SELECT 
                u.user_id, 
                c.complainant_id, 
                (SELECT cc.category_name 
                 FROM Complainant_Category cc 
                 WHERE cc.complainant_category_id = c.complainant_category_id) AS complainant_category,
                (SELECT ip.proof_type 
                 FROM Identity_Proof ip 
                 WHERE ip.identity_proof_id = 
                       (SELECT ui.identity_proof_id 
                        FROM Users_Identity ui 
                        WHERE ui.user_id = u.user_id)) AS proof_type,
                (SELECT ui.identity_proof_number 
                 FROM Users_Identity ui 
                 WHERE ui.user_id = u.user_id) AS identity_proof_number,
                u.name, 
                u.age, 
                u.gender, 
                u.email,
                u.phone_no
            FROM Users u
            INNER JOIN Complainants c ON u.user_id = c.user_id
            WHERE u.user_id = $1
        `;
            const result = await pool.query(query, [user_id]);
            return result.rows[0];
            
        } catch (error) {
            throw new Error(error);
        }
    }

}

export default Forms;