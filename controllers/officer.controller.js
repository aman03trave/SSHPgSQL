// Assuming Node.js + Express + PostgreSQL using pg module
// File: controllers/officerController.js

// const pool = require('../db');
import pool from '../config/db.js';
import Users from '../services/user.service.js';
import Grievances from '../services/grievance.service.js';
import bcrypt from 'bcryptjs';
import Grievance_Media from '../model/grievance_media.model.js';

const user = new Users();
const form = new Grievances();

// Level 1 Officer Services



export const add_Officer = async (req, res, next) => {
    const client = await pool.connect();
    try {
        const {
            name,
            email,
            age,
            gender,
            phone,
            password,
            role_name,
            district_name,
            block_name // optional for level 1
        } = req.body;
        console.log(block_name);
        let block_id = null;
        if (block_name && block_name !== "NULL" && block_name !== "null") {
            block_id = await form.getBlock(block_name);
        }    
        // Check for required fields
        if (!name || !email || !phone|| !age || !gender  || !password || !role_name || !district_name) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const role_id = await user.getRole_id(role_name);
        // const block_id = await form.getBlock(block_name);

        await client.query('BEGIN');
        const id = await pool.query('SELECT COUNT(*) FROM users');
          const count = parseInt(id.rows[0].count, 10); // Extract count from result
          const user_id = `U-${1000 + count + 1}`;

        
        const district_id = await form.getDistrict(district_name);
        const hashedPassword = await bcrypt.hash(password, 20);

        // 1. Insert into users table
        const userInsertQuery = `
            INSERT INTO users (user_id, name, email, age, gender, phone_no, password, role_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING user_id
        `;
        console.log(name, role_name, phone);
         // Or whatever your role_ids are
        const userResult = await client.query(userInsertQuery, [user_id, name, email, age, gender, phone, hashedPassword, role_id]);
        const officer_id = userResult.rows[0].user_id;

        // 2. Insert into officer_info
        const officerInsertQuery = `
            INSERT INTO officer_info (officer_id, district_id, block_id)
            VALUES ($1, $2, $3)
        `;
        const blockValue = (role_id == 5) ? block_id : null;
        await client.query(officerInsertQuery, [officer_id, district_id, blockValue]);

        await client.query('COMMIT');

        res.status(201).json({ message: "Officer added successfully", officer_id });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error adding officer:", err);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        client.release();
    }
};


export const getGrievancesByDistrict = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const district = await pool.query('SELECT district_id FROM officer_info WHERE officer_id = $1', [user_id]);
    console.log(district.rows[0].district_id);
    // const grievances = await pool.query(`
    //   SELECT * FROM grievances g
    //   WHERE g.district_id = $1
    // `, [district.rows[0].district_id]);
    
    const result = await pool.query(`SELECT 
        g.*
        FROM 
        Grievances g
        WHERE 
        g.district_id = $1;
`, [district.rows[0].district_id]);
const grievance = result.rows;

const grievances = await Promise.all(
grievance.map(async (grievance) => {
const media = await Grievance_Media.findOne({ grievanceId: grievance.grievance_id });
return {
...grievance,
media: media ? {
image: media.image,
document: media.document
} : null
};
})
);
    res.json(grievances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBlockOfficersWithGrievanceCount = async (req, res) => {
  const user_id  = req.user.user_id;
  try {
    const { district_id } = (await pool.query('SELECT district_id FROM officer_info WHERE officer_id = $1', [user_id])).rows[0];
    const result = await pool.query(`
      SELECT u.user_id, u.name, COUNT(ga.grievance_id) as grievance_count
      FROM users u
      JOIN officer_info o ON u.user_id = o.officer_id
      LEFT JOIN grievance_assignment ga ON u.user_id = ga.assigned_to
      WHERE o.district_id = $1 AND o.block_id IS NOT NULL
      GROUP BY u.user_id, u.name
    `, [district_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const assignGrievance = async (req, res) => {
  const { grievance_id, assigned_to } = req.body;
  const user_id = req.user.user_id;
  try {
    await pool.query('BEGIN');
    await pool.query(`
      INSERT INTO grievance_assignment (grievance_id, assigned_by, assigned_to)
      VALUES ($1, $2, $3)
    `, [grievance_id, user_id, assigned_to]);
    await pool.query(`
      INSERT INTO action_log (grievance_id, user_id, action_code_id)
      VALUES ($1, $2, 2)
    `, [grievance_id, user_id]);
    await pool.query('COMMIT');
    res.json({ message: 'Grievance assigned' });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
};

export const getAssignedGrievances = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const result = await pool.query(`
      SELECT g.* FROM grievances g
      JOIN grievance_assignment ga ON g.grievance_id = ga.grievance_id
      WHERE ga.assigned_by = $1
    `, [user_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const reviewATR = async (req, res) => {
  const { atr_id, status, remarks } = req.body;
  const user_id  = req.user.user_id;
  const grievance_id = (await pool.query('SELECT grievance_id FROM atr_reports WHERE atr_id = $1', [atr_id])).rows[0].grievance_id;
  const action_code_id = status === 'accepted' ? 4 : 5;

  try {
    await pool.query('BEGIN');
    await pool.query(`
      INSERT INTO atr_review (atr_id, reviewed_by, status, remarks)
      VALUES ($1, $2, $3, $4)
    `, [atr_id, user_id, status, remarks]);

    await pool.query(`
      INSERT INTO action_log (grievance_id, user_id, action_code_id)
      VALUES ($1, $2, $3)
    `, [grievance_id, user_id, action_code_id]);

    if (status === 'accepted') {
      await pool.query(`
        UPDATE grievance_assignment SET current_status = 'disposed'
        WHERE grievance_id = $1
      `, [grievance_id]);
      await pool.query(`
        INSERT INTO action_log (grievance_id, user_id, action_code_id)
        VALUES ($1, $2, 7)
      `, [grievance_id, user_id]);
    }
    await pool.query('COMMIT');
    res.json({ message: 'Review completed' });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
};

// Level 2 Officer Services

export const getAssignedToMe = async (req, res) => {
  const { user_id } = req.user;
  try {
    const result = await pool.query(`
      SELECT g.* FROM grievances g
      JOIN grievance_assignment ga ON g.grievance_id = ga.grievance_id
      WHERE ga.assigned_to = $1
    `, [user_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadATR = async (req, res) => {
  const { grievance_id, atr_text } = req.body;
  const { user_id } = req.user;
  try {
    const version = (await pool.query('SELECT COUNT(*) FROM atr_reports WHERE grievance_id = $1', [grievance_id])).rows[0].count;
    await pool.query(`
      INSERT INTO atr_reports (grievance_id, generated_by, atr_text, version)
      VALUES ($1, $2, $3, $4)
    `, [grievance_id, user_id, atr_text, Number(version) + 1]);

    await pool.query(`
      INSERT INTO action_log (grievance_id, user_id, action_code_id)
      VALUES ($1, $2, 3)
    `, [grievance_id, user_id]);

    res.json({ message: 'ATR uploaded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
