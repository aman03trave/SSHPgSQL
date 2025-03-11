import db from '../config/db.js';
const pool = db;




class Users {
    async createUser(name, email, password) {
        const id = parseInt(name.length + Math.random() * 1000);
        await pool
           .query('INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)', [id, name, email, password])
           .then(() => {
             console.log('User created successfully')
           }       
        )
           .catch(err => console.error('Error inserting user:', err.stack));
           
    }
}

export default Users;