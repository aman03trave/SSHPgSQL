// Assuming Node.js + Express + PostgreSQL using pg module
// File: controllers/officerController.js

// const pool = require('../db');
import pool from '../config/db.js';
import Users from '../services/user.service.js';
import Grievances from '../services/grievance.service.js';
import bcrypt from 'bcrypt';
import Grievance_Media from '../model/grievance_media.model.js';
import ATR_Media from '../model/atr_media.model.js';
import Officer from '../services/officer.services.js';
import { response } from 'express';
import { getDisposedGrievancesWithDetailsService } from "../services/officer.services.js";


const user = new Users();
const form = new Grievances();
const officer = new Officer();

// Level 1 Officer Services


//add officer as a new user---------
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


//get grievance based on the districts for level 1 officer
export const getGrievancesByDistrict = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    // Get district ID for the officer
    const district = await pool.query(
      'SELECT district_id FROM officer_info WHERE officer_id = $1',
      [user_id]
    );

    const districtId = district.rows[0].district_id;

    // Join grievances with blocks, schools, complainants → users
    const result = await pool.query(`
      SELECT 
        g.*,
        b.block_name,
        s.school_name,
        u.name
      FROM 
        grievances g
      LEFT JOIN blocks b ON g.block_id = b.block_id
      LEFT JOIN school s ON g.school_id = s.school_id
      LEFT JOIN complainants c ON g.complainant_id = c.complainant_id
      LEFT JOIN users u ON c.user_id = u.user_id
      LEFT JOIN grievance_assignment ga ON g.grievance_id = ga.grievance_id
      WHERE 
        g.district_id = $1
        AND ga.grievance_id IS NULL
    `, [districtId]);

    const grievanceRows = result.rows;

    // Attach MongoDB media
    const grievances = await Promise.all(
      grievanceRows.map(async (grievance) => {
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
    console.error("Error in getGrievancesByDistrict:", err);
    res.status(500).json({ error: err.message });
  }
};

//get the new grievances count for level 1

export const get_New_Grievance_Count = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;

    const result = officer.getNewGrievanceCount(user_id);

    res.status(200).json({count:result});
  } catch (error) {
    throw (error);
  }
}


//get the list of block officers with the grievances count which they are currently handling
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


//assign grievances to the level2 officer
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




//get the grievances that are already been assigned to level 2 officers
export const getAssignedGrievances = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const result = await pool.query(`
      SELECT 
        g.title, 
        g.description,
        u.name AS assigned_to_name,
        ga.assigned_at
      FROM grievances g
      JOIN grievance_assignment ga ON g.grievance_id = ga.grievance_id
      JOIN Complainants c ON g.complainant_id = c.complainant_id
      JOIN Users u ON ga.assigned_to = u.user_id
      WHERE ga.assigned_by = $1
    `, [user_id]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//display the count of grievances that are assigned.

export const getAssignedGrievanceCount = async (req,res,next) => {
  try {
    const user_id = req.user.user_id;

    const result = await officer.assignedGrievanceCount(user_id);
    res.status(200).json({count:result});

  } catch (error) {
    throw (error);
  }
}


//get the ATR uploaded by the level 2 officer
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

//get atr_uploads

export const Display_ATR_L1 = async (req, res, next) => {
  try {
    console.log("Inside the display_atr function");
    const user_id = req.user.user_id;
    const result = await pool.query(`
                                    SELECT g.title,
                                    g.description,
                                    u.name
                                    FROM grievances g
                                    JOIN atr_report a_r ON a_r.grievance_id = g.grievance_id
                                    JOIN grievance_assignment g_a ON g_a.grievance_id = g.grievance_id
                                    JOIN Users u ON u.user_id = g_a.assigned_to
                                    where g_a.assigned_by = $1`, [user_id]);
    const grievanceRows = result.rows;

    const grievances = await Promise.all(
      grievanceRows.map(async (grievance) => {
        const media = await ATR_Media.findOne({ atr_id: grievance.grievance_id });
        return {
          ...grievance,
          media: media ? {
            document: media.document
          } : null
        };
      })
    );

    res.json(grievances);


  } catch (error) {
    throw (error);
  }
}

// get the atr display count
export const Display_ATR_L1_count = async (req, res, next) => {
  try {
    console.log("Inside the display_atr_count function");
    const user_id = req.user.user_id;
    const result = await officer.Display_ATR_L1(user_id);

    res.json({count : result});


  } catch (error) {
    throw (error);
  }
}

//get the disposed grievances list 
export const Get_Disposed = async(req, res, next) => {
  try {
    console.log("Inside get disposed function.");

    const user_id = req.user.user_id;

    const query = await pool.query(`
                                  SELECT g.grievance_id,
                                  g.title,
                                  g.description,
                                  a_l.action_timestamp
                                  
                                  FROM officer_info o
                                  JOIN grievances g ON o.district_id = g.district_id
                                  JOIN action_log a_l ON o.officer_id = a_l.user_id
                                  WHERE a_l.action_code_id = 7 AND o.officer_id = $1`, [user_id]);

    
    const grievanceRows = query.rows;

    // Attach MongoDB media
    const grievances = await Promise.all(
      grievanceRows.map(async (grievance) => {
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
    res.status(200).json(grievances);
  } catch (error) {
    throw (error);
  }
}

//get the count of the disposed grievances
export const get_disposed_count = async (req,res, next) => {
  try {
    const user_id = req.user.user_id;

    const result = officer.get_disposed(user_id);

    res.status(200).json({count:result});
  } catch (error) {
    throw (error);
  }
}

//fetch all the  notification count for level1 officer
export const L1_countUserNotification = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const reminders = await officer.CheckForReminderLevel1(user_id); // call correct function

        // const count = reminders.reduce((total, item) => {
        //     // if (item.notification_type === 'Reminder Eligibility' && !item.can_send_reminder) {
        //     //     return total;
        //     // }
        //     return total + 1;
        // }, 0);
        

        return res.status(200).json({ count:reminders });
    } catch (error) {
        console.error("Error counting notifications:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

//fetch all the notications for level1 officer
export const checkForReminderLevel1 = async (req, res) => {
  try {
    console.log("Inside the Reminder Function");
    const user_id = req.user.user_id;

    const query = await pool.query(
      `SELECT 
          a.action_id,
          a.grievance_id,
          a.user_id AS officer_id,
          ac.code AS action_code,
          a.action_timestamp,
          g.title,
          g.description,
          g.created_at,
          u1.name as level1_officer,
          u2.name as complainant
        FROM Action_Log a
        JOIN Action_Code ac ON a.action_code_id = ac.action_code_id
        JOIN officer_info o ON o.officer_id = $1
        JOIN Grievances g ON g.grievance_id = a.grievance_id
        JOIN Grievance_assignment g_a ON g_a.grievance_id = g.grievance_id
        JOIN Users u1 ON u1.user_id = g_a.assigned_to
        JOIN Complainants c on c.complainant_id = g.complainant_id
        JOIN Users u2 ON u2.user_id = c.user_id
        WHERE a.action_code_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9) AND o.block_id IS NULL
        ORDER BY a.action_timestamp DESC`, [user_id]
    );

    res.status(200).json(query.rows);
  } catch (error) {
    throw error;
  }
};

//Get all the returned grievance
export const Get_Returned_Grievance = async (req, res, next) => {
  try {
    console.log("Inside the get returned function");

    const result = await pool.query(`
                                    SELECT g.*,
                                    a_l.action_timestamp
                                    From grievances g
                                    JOIN action_log a_l ON a_l.grievance_id = g.grievance_id
                                    JOIN officer_info o ON o.district_id = g.district_id
                                    where a_l.action_code_id = 8 and o.officer_id = $1`, [user_id]);

    const grievanceRows = result.rows;

    // Attach MongoDB media
    const grievances = await Promise.all(
      grievanceRows.map(async (grievance) => {
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
  } catch (error) {
    throw (error);
  }
}

//get count
export const Get_Returned_Grievance_Count = async (req, res, next) => {
  const user_id = req.user.user_id;
  try {
    console.log("Inside the get returned grievance count function.");
    const result = await officer.display_returned_grievance(user_id);

    res.status(200).json({count : result});
  } catch (error) {
    throw (error);
  }
}


// Level 2 Officer Services


export const getAssignedToMe = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const result = await pool.query(`
      SELECT 
        g.grievance_id,
        g.title,
        g.description,
        u.name AS assigned_by,
        ga.assigned_at
      FROM grievance_assignment ga
      JOIN grievances g ON g.grievance_id = ga.grievance_id
      JOIN users u ON u.user_id = ga.assigned_by
      LEFT JOIN (
        SELECT DISTINCT ON (grievance_id) grievance_id, action_code_id
        FROM action_log
        ORDER BY grievance_id, action_timestamp DESC
      ) latest_action ON latest_action.grievance_id = ga.grievance_id
      WHERE ga.assigned_to = $1
        AND (latest_action.action_code_id IS NULL OR latest_action.action_code_id NOT IN (8, 9));
    `, [user_id]);
    
      const grievanceRows = result.rows;

    // Attach MongoDB media
    const grievances = await Promise.all(
      grievanceRows.map(async (grievance) => {
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



export const uploadATR = async (req, res) => {
  const { grievance_id } = req.body;
  const user_id = req.user.user_id;

  if (!grievance_id) {
    return res.status(400).json({ error: "Missing grievance_id" });
  }

  const documentFile = req.files?.["atr"]?.[0];
  const documentPath = documentFile ? documentFile.path : null;

  try {
    const versionRes = await pool.query(
      "SELECT COUNT(*) FROM atr_reports WHERE grievance_id = $1",
      [grievance_id]
    );
    const version = parseInt(versionRes.rows[0].count, 10) + 1;

    const id = await pool.query('SELECT COUNT(*) FROM atr_reports');
    const count = parseInt(id.rows[0].count, 10); // Extract count from result
    const atr_id = count + 1;

    await pool.query(
      `
      INSERT INTO atr_reports (atr_id, grievance_id, generated_by, version)
      VALUES ($1, $2, $3, $4)
      `,
      [atr_id, grievance_id, user_id, version]
    );

    if (documentPath) {
      const grievanceMedia = new ATR_Media({
        atr_id,
        document: documentPath,
      });
      await grievanceMedia.save();
    }

    await pool.query(
      `
      INSERT INTO action_log (grievance_id, user_id, action_code_id)
      VALUES ($1, $2, 3)
      `,
      [grievance_id, user_id]
    );

    res.status(200).json({ message: "ATR uploaded successfully", atr_id });
  } catch (err) {
    console.error("Error uploading ATR:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAcceptedGrievance = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const result = await pool.query(`
      SELECT 
        g.grievance_id,
        g.title,
        g.description,
        u.name AS assigned_by,
        ga.assigned_at
      FROM grievance_assignment ga
      JOIN grievances g ON g.grievance_id = ga.grievance_id
      JOIN users u ON u.user_id = ga.assigned_by
      LEFT JOIN (
        SELECT DISTINCT ON (grievance_id) grievance_id, action_code_id
        FROM action_log
        ORDER BY grievance_id, action_timestamp DESC
      ) latest_action ON latest_action.grievance_id = ga.grievance_id
      WHERE ga.assigned_to = $1
        AND (latest_action.action_code_id IN (9));
    `, [user_id]);
    

    const grievanceRows = result.rows;

    // Attach MongoDB media
    const grievances = await Promise.all(
      grievanceRows.map(async (grievance) => {
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
}


export const checkForReminderLevel2 = async (req, res) => {
  try {
    console.log("Inside the Reminder Function");
    const user_id = req.user.user_id;

    const query = await pool.query(
      `SELECT 
          a.action_id,
          a.grievance_id,
          a.user_id AS officer_id,
          ac.code AS action_code,
          a.action_timestamp,
          g.title,
          g.description,
          g.created_at,
          u1.name as level1officer,
          u2.name as complainant
        FROM Action_Log a
        JOIN Action_Code ac ON a.action_code_id = ac.action_code_id
        JOIN officer_info o ON o.officer_id = $1
        JOIN Grievances g ON g.grievance_id = a.grievance_id
        JOIN Grievance_assignment g_a ON g_a.grievance_id = g.grievance_id
        JOIN Users u1 ON u1.user_id = g_a.assigned_by
        JOIN Complainants c on c.complainant_id = g.complainant_id
        JOIN Users u2 ON u2.user_id = c.user_id
        WHERE a.action_code_id IN (2,3,4,5,6,7,8,9)
        ORDER BY a.action_timestamp DESC`, [user_id]
    );

    res.status(200).json(query.rows);
  } catch (error) {
    throw error;
  }
};


export const L2_countUserNotification = async (req, res) => {
  try {
      const user_id = req.user.user_id;
      console.log(user_id);
      const reminders = await officer.checkForReminderLevel2(user_id); // call correct function

      // const count = reminders.reduce((total, item) => {
      //     // if (item.notification_type === 'Reminder Eligibility' && !item.can_send_reminder) {
      //     //     return total;
      //     // }
      //     return total + 1;
      // }, 0);


      return res.status(200).json({ reminders });
  } catch (error) {
      console.error("Error counting notifications:", error);
      return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const Return_Grievance = async (req, res, next) => {
  
  try {
    const {grievance_id} = req.body;
    const user_id = req.user.user_id;

    const result = await pool.query(`
                                    DELETE FROM grievance_assignments where grievance_id = $1 and assigned_to = $2`, [grievance_id, user_id]);
    
    const add_log = await pool.query('INSERT INTO action_log(grievance_id, user_id, action_code_id) values($1, $2, 8)', [grievance_id, user_id] );

    res.status(200).message("Grievance returned successfully.");
  } catch (error) {
    throw(error);
  }
}


//show atr uploaded by level 2 officer

export const Display_ATR_L2 = async (req, res, next) => {
  try {
    console.log("Inside the display_atr function");

    const result = await pool.query(`
                                    SELECT g.title,
                                    g.description,
                                    u.name
                                    FROM grievances g
                                    JOIN atr_reports a_r ON a_r.grievance_id = g.grievance_id
                                    JOIN grievance_assignment g_a ON g_a.grievance_id = g.grievance_id
                                    JOIN Users u ON u.user_id = g_a.assigned_by
                                    where g_a.assigned_to = $1`, [user_id]);
    const grievanceRows = result.rows;

    const grievances = await Promise.all(
      grievanceRows.map(async (grievance) => {
        const media = await ATR_Media.findOne({ atr_id: grievance.grievance_id });
        return {
          ...grievance,
          media: media ? {
            document: media.document
          } : null
        };
      })
    );

    res.json(grievances);


  } catch (error) {
    throw (error);
  }
}


export const Get_Disposed_Details = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const data = await getDisposedGrievancesWithDetailsService(userId);
    res.json({ grievances: data });
  } catch (error) {
    console.error("Error in Get_Disposed_Details:", error);
    res.status(500).json({ error: error.message });
  }
};




