import db from '../config/db.js';
const pool = db;




class Users {
    async createUser(name, email, password) {
        const id = parseInt(name.length + Math.random() * 1000);
        await pool
           .query('INSERT INTO Users (id, name, gender, age, email, password, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7)', [id, name, gender, age, email, password, role_id])
           .then(() => {
             console.log('User created successfully')
           }       
        )
           .catch(err => console.error('Error inserting user:', err.stack));
           
    }

    async getRole_id(role_name) {
      const result = await pool.query('SELECT role_id FROM Roles WHERE role_name = $1', [role_name]);
      return result.rows[0].role_id;
    }
}

export default Users;