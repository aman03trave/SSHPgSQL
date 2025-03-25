import db from '../config/db.js';
import bycrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const pool = db;




class Users {
    async createUser(name, gender, age, phone, email, password, role_id) {
        
        try{
          const id = parseInt(name.length + Math.random() * 1000);

        const hashedPassword = await bycrypt.hash(password, 20);
        await pool
           .query('INSERT INTO Users (user_id, name, gender, age, email, password, role_id, phone_no) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [id, name, gender, age, email, hashedPassword, role_id, phone])
        }catch(e) {
          throw new Error(`Error creating user: ${e.message}`);
          next(e);
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
}

export default Users;