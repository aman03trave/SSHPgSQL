import db from '../config/db.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import errorHandler from '../middleware/errorMiddleware.js';
const pool = db;


class Users {

  async CreateComplainant(category_id, user_id){
    try {
      console.log('Creating complaint', category_id, user_id);
    const re = await pool.query('SELECT COUNT(*) FROM complainants');
    const count = parseInt(re.rows[0].count, 10); // Extract count from result
    const complainant_id = `C-${1000 + count + 1}`;
    const result = await pool.query('INSERT INTO Complainants (complainant_id, user_id, complainant_category_id) VALUES ($1, $2, $3)', [complainant_id, user_id, category_id]);
    console.log(result);
    return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating complaint: ${error.message}`);
      // next(error);
    }
    
  }
    async createUser(name, gender, age, phone, email, password, role_id, category_id) {
        
        try{
          const id = await pool.query('SELECT COUNT(*) FROM users');
          const count = parseInt(id.rows[0].count, 10); // Extract count from result
          const user_id = `U-${1000 + count + 1}`;
          
        const hashedPassword = await bcrypt.hash(password, 20);
        await pool
           .query('INSERT INTO Users (user_id, name, gender, age, email, password, role_id, phone_no) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [user_id, name, gender, age, email, hashedPassword, role_id, phone]);

        await this.CreateComplainant(category_id, user_id);
        }catch(e) {
          throw new Error(`Error creating user: ${e.message}`);
          // next(e);
        }
    }

    async getRole_id(role_name) {
      console.log('Getting role', role_name)
      const result = await pool.query('SELECT role_id FROM Roles WHERE role_name = $1', [role_name]);
  
    if (result.rows.length === 0) {
      throw new Error(`Role '${role_name}' not found.`);
    }

    return result.rows[0].role_id;
    }

    async findUser(email) {
      console.log('Finding user', email);
      const result = await pool.query('SELECT * FROM Users user_id WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        throw new Error('Invalid email or password.');
      }
      console.log(result);
      return result.rows[0];
    }

    async findCategory(category){
      console.log('Finding category', category);
      const result = await pool.query('SELECT * FROM Complainant_Category WHERE category_name = $1', [category]);
      if (result.rows.length === 0) {
        throw new Error('Invalid category.');
      }
      console.log(result);
      return result.rows[0].complainant_category_id;
    }

    async updateUser (user_id, { name, age, gender, phone }){
      try {
        const result = await db.query(
          `UPDATE Users 
           SET name = $1, age = $2, gender = $3, phone_no = $4
           WHERE user_id = $5 
           RETURNING user_id, name, age, gender, phone_no, email`,
          [name, age, gender, phone, user_id]
        );
    
        return result.rows[0]; // Return updated user
      } catch (error) {
        console.error("Database error:", error);
        throw new Error("Database operation failed");
      }
    
    }

    async getUserProfile(userId){
      try {
        const result = await pool.query('SELECT name, age, phone_no, gender FROM Users WHERE user_id = $1', [userId]);
        return result.rows[0];
      } catch (error) {
        throw new Error(`Error getting user : '${userId, error}'`)
      }
    }
    

    
};


export default Users;