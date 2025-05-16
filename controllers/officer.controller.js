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
        const hashedPassword = await bcrypt.hash(password, 12);

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
    // 🔎 Get district ID for the officer
    const district = await pool.query(
      'SELECT district_id FROM officer_info WHERE officer_id = $1',
      [user_id]
    );

    const districtId = district.rows[0].district_id;

    // 🔎 Join grievances with blocks, schools, complainants → users
    const result = await pool.query(`
      SELECT 
        g.grievance_id,
        g.title,
        g.description,
        g.created_at,
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

    // 🔎 Fetching all media for each grievance from MongoDB
    const grievances = await Promise.all(
      grievanceRows.map(async (grievance) => {
        const media = await Grievance_Media.find({ grievanceId: grievance.grievance_id });
        
        // 🔎 Map images and documents into separate arrays
        const images = media
          .filter((item) => item.image)
          .map((item) => item.image);

        const documents = media
          .filter((item) => item.document)
          .map((item) => item.document);

        // 🔄 Structure the response object
        return {
          ...grievance,
          grievance_media: {
            images,
            documents
          }
        };
      })
    );

    // 📝 Respond with the final grievances list
    res.status(200).json(grievances);

  } catch (err) {
    console.error("Error in getGrievancesByDistrict:", err);
    res.status(500).json({ error: err.message });
  }
};


//get the new grievances count for level 1

export const get_New_Grievance_Count = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;

    const result = await officer.getNewGrievanceCount(user_id);

    res.status(200).json({count:result});
  } catch (error) {
    throw (error);
  }
}


//get the list of block officers with the grievances count which they are currently handling
export const getBlockOfficersWithGrievanceCount = async (req, res) => {
  const user_id = req.user.user_id;
  const grievanceId = req.query.grievance_id;

  if (!grievanceId) {
    return res.status(400).json({ error: "Missing grievance_id in query" });
  }

  try {
    // Step 1: Verify the district from the authenticated officer
    const districtResult = await pool.query(
      'SELECT district_id FROM officer_info WHERE officer_id = $1',
      [user_id]
    );

    if (districtResult.rows.length === 0) {
      return res.status(404).json({ error: "Officer's district not found" });
    }

    const district_id = districtResult.rows[0].district_id;

    // Step 2: Get block_id from grievance_id
    const grievanceResult = await pool.query(
      'SELECT block_id FROM grievances WHERE grievance_id = $1',
      [grievanceId]
    );

    if (grievanceResult.rows.length === 0) {
      return res.status(404).json({ error: "Grievance not found" });
    }

    const block_id = grievanceResult.rows[0].block_id;

    // Step 3: Fetch officers based on block + district and count active grievances
    const officersResult = await pool.query(`
      SELECT 
        u.user_id AS officer_id,
        u.name AS officer_name,
        COUNT(DISTINCT ga.grievance_id) AS grievance_count
      FROM 
        officer_info oi
      JOIN 
        users u ON oi.officer_id = u.user_id
      LEFT JOIN 
        grievance_assignment ga ON oi.officer_id = ga.assigned_to
      LEFT JOIN 
        action_log al ON al.grievance_id = ga.grievance_id 
        AND al.action_code_id NOT IN (7) -- Exclude disposed grievances
      WHERE 
        oi.district_id = $1 
        AND oi.block_id = $2
      GROUP BY 
        u.user_id, u.name
    `, [district_id, block_id]);

    res.status(200).json(officersResult.rows);
  } catch (error) {
    console.error('Error fetching block officers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
        g.grievance_id,
        g.title,
        g.description,
        g.created_at,
        b.block_name,
        s.school_name,
        u.name AS assigned_to_name,
        ga.assigned_at
      FROM grievances g
      JOIN grievance_assignment ga ON g.grievance_id = ga.grievance_id
      JOIN blocks b ON b.block_id = g.block_id
      JOIN school s ON s.school_id = g.school_id
      JOIN Complainants c ON g.complainant_id = c.complainant_id
      JOIN Users u ON ga.assigned_to = u.user_id
      WHERE ga.assigned_by = $1
    `, [user_id]);


    const grievanceRows = result.rows;

    // 🔎 Fetching all media for each grievance from MongoDB
    const grievances = await Promise.all(
      grievanceRows.map(async (grievance) => {
        const media = await Grievance_Media.find({ grievanceId: grievance.grievance_id });
        
        // 🔎 Map images and documents into separate arrays
        const images = media
          .filter((item) => item.image)
          .map((item) => item.image);

        const documents = media
          .filter((item) => item.document)
          .map((item) => item.document);

        // 🔄 Structure the response object
        return {
          ...grievance,
          grievance_media: {
            images,
            documents
          }
        };
      }
    )
  )

    res.json(grievances);
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
  
  // Fetch the corresponding grievance_id from atr_reports
  // const grievanceResult = await pool.query(
  //   'SELECT grievance_id FROM atr_reports WHERE atr_id = $1',
  //   [atr_id]
  // );

  // const grievance_id = grievanceResult.rows[0]?.grievance_id;
  
  if (!atr_id) {
    return res.status(404).json({ error: 'Grievance ID not found for the provided ATR ID' });
  }

  const action_code_id = status === 'accepted' ? 4 : 5;

  try {
    await pool.query('BEGIN');

    // Insert into atr_review
    await pool.query(`
      INSERT INTO atr_review (atr_id, reviewed_by, status, remarks)
      VALUES ($1, $2, $3, $4)
    `, [atr_id, user_id, status, remarks]);

    // Insert into action_log with the correct action code
    await pool.query(`
      INSERT INTO action_log (grievance_id, user_id, action_code_id)
      VALUES ($1, $2, $3)
    `, [atr_id, user_id, action_code_id]);

    // If accepted, log an additional action for "Closed" (7)
    if (status === 'accepted') {
      await pool.query(`
        INSERT INTO action_log (grievance_id, user_id, action_code_id)
        VALUES ($1, $2, 7)
      `, [atr_id, user_id]);
    }

    await pool.query('COMMIT');
    res.json({ message: 'Review completed' });

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error("Error during reviewATR:", err.message);
    res.status(500).json({ error: err.message });
  }
};


//get atr_uploads

export const Display_ATR_L1 = async (req, res, next) => {
  try {
    console.log("Inside the display_atr function");
    const user_id = req.user.user_id;
    const result = await pool.query(`
                                    SELECT DISTINCT
                                          g.title,
                                          g.description,
                                          u1.name AS officer_name,
                                          g.grievance_id,
                                          latest_action.action_code_id AS latest_action_code_id
                                      FROM 
                                          grievances g
                                      JOIN 
                                          atr_reports a_r ON a_r.grievance_id = g.grievance_id
                                      JOIN 
                                          atr_review a ON a.atr_id = a_r.grievance_id
                                      JOIN 
                                          grievance_assignment g_a ON g_a.grievance_id = g.grievance_id
                                      JOIN 
                                          users u1 ON u1.user_id = g_a.assigned_to
                                      LEFT JOIN (
                                          -- Subquery to get the latest action for each grievance
                                          SELECT 
                                              grievance_id, 
                                              action_code_id
                                          FROM 
                                              action_log al
                                          WHERE 
                                              (al.grievance_id, al.action_timestamp) IN (
                                                  SELECT 
                                                      grievance_id, 
                                                      MAX(action_timestamp) 
                                                  FROM action_log 
                                                  GROUP BY grievance_id
                                              )
                                      ) latest_action ON latest_action.grievance_id = g.grievance_id
                                      WHERE 
                                          g_a.assigned_by = $1
                                          AND a.status = 'accepted'
                                          AND NOT EXISTS (
                                              SELECT 1 
                                              FROM action_log sub_a_l 
                                              WHERE sub_a_l.grievance_id = g.grievance_id 
                                                AND sub_a_l.action_code_id IN (7, 4)
                                          );

`, [user_id]);
    const grievanceRows = result.rows;

    const grievances = await Promise.all(
      grievanceRows.map(async (grievance) => {
        // ✅ 1. Fetch Grievance Media
        const media = await Grievance_Media.find({ grievanceId: grievance.grievance_id });

        // Separate images and documents
        const images = media.filter((item) => item.image).map((item) => item.image);
        const documents = media.filter((item) => item.document).map((item) => item.document);

        const atrVersions = await ATR_Media.find({ atr_id: grievance.grievance_id }).sort({ version: 1 });

        
        const ATR = atrVersions.map((atr) => ({
          version: [atr.version],
          documents: atr.document ? [atr.document] : []
        }));

        return {
          ...grievance,
          grievance_media: {
            images,
            documents,
          },
          ATR,
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
export const Get_Disposed_L1 = async(req, res) => {
  try {
    console.log("Inside get disposed function.");

    const user_id = req.user.user_id;
    console.log(user_id);
     const result = await pool.query(`
  SELECT 
    g.grievance_id,
    g.title,
    g.description,
    g.created_at AS submission_time,
    a_l.action_timestamp AS disposed_time
  FROM grievances g
  JOIN action_log a_l ON a_l.grievance_id = g.grievance_id
  WHERE a_l.action_code_id = 7 AND a_l.user_id = $1
  ORDER BY a_l.action_timestamp DESC
`, [user_id]);

const grievances = [];

for (const row of result.rows) {
  // Fetch all media associated with the grievance
  const media = await Grievance_Media.find({ grievanceId: row.grievance_id });

  // Separate images and documents
  const images = media.filter(m => m.image).map(m => m.image);
  const documents = media.filter(m => m.document).map(m => m.document);

  // Fetch all ATR media associated with the grievance (assuming multiple ATR documents are possible)
  const atrMedia = await ATR_Media.find({ atr_id: row.grievance_id });

  grievances.push({
    grievance_id: row.grievance_id,
    title: row.title,
    description: row.description,
    submission_time: row.submission_time,
    disposed_time: row.disposed_time,
    grievance_media: {
      images: images,
      documents: documents
    },
    final_atr_report: atrMedia.length > 0 ? atrMedia.map(atr => ({
      document: atr.document,
      uploaded_time: atr._id.getTimestamp()
    })) : null
  });
}

// return grievances;
console.log(grievances);

res.status(200).json(grievances);

  } catch (error) {
    throw (error);
  }
}

//get the count of the disposed grievances
export const get_disposed_count = async (req,res, next) => {
  try {
    const user_id = req.user.user_id;

    const query = await officer.get_disposed(user_id);

    res.status(200).json({count:query});
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
    main.action_id,
    main.grievance_id,
    main.officer_id,
    main.action_code,
    main.action_timestamp,
    main.title,
    main.description,
    main.created_at,
    main.level1_officer,
    main.complainant,
    main.reminder_id,
    main.reminder_timestamp,
    main.viewed,
    main.type
FROM (
    -- Subquery for Reminders (only one per grievance if exists and not viewed)
    SELECT 
        DISTINCT ON (g.grievance_id) 
        NULL AS action_id,
        g.grievance_id,
        g_a.assigned_to AS officer_id,
        'Reminder' AS action_code,
        r.reminder_timestamp AS action_timestamp,
        g.title,
        g.description,
        g.created_at,
        u1.name AS level1_officer,
        u2.name AS complainant,
        r.reminder_id,
        r.reminder_timestamp,
        r.viewed,
        'Reminder' AS type
    FROM 
        Grievances g
    JOIN 
        Grievance_assignment g_a ON g_a.grievance_id = g.grievance_id
    JOIN 
        Users u1 ON u1.user_id = g_a.assigned_to
    JOIN 
        Complainants c ON c.complainant_id = g.complainant_id
    JOIN 
        Users u2 ON u2.user_id = c.user_id
    LEFT JOIN 
        Reminders r ON r.grievance_id = g.grievance_id
    WHERE 
        r.reminder_id IS NOT NULL
    
    -- No ORDER BY inside the subquery
    -- The ordering will be done in the main query

    UNION ALL

    -- Subquery for Notifications from Action Log
    SELECT 
        a.action_id,
        a.grievance_id,
        a.user_id AS officer_id,
        ac.code AS action_code,
        a.action_timestamp,
        g.title,
        g.description,
        g.created_at,
        u1.name AS level1_officer,
        u2.name AS complainant,
        NULL AS reminder_id,
        NULL AS reminder_timestamp,
        NULL AS viewed,
        'Notification' AS type
    FROM 
        Action_Log a
    JOIN 
        Action_Code ac ON a.action_code_id = ac.action_code_id
    JOIN 
        officer_info o ON o.officer_id = $1
    JOIN 
        Grievances g ON g.grievance_id = a.grievance_id
    JOIN 
        Grievance_assignment g_a ON g_a.grievance_id = g.grievance_id
    JOIN 
        Users u1 ON u1.user_id = g_a.assigned_to
    JOIN 
        Complainants c ON c.complainant_id = g.complainant_id
    JOIN 
        Users u2 ON u2.user_id = c.user_id
    WHERE 
        a.action_code_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9) 
        AND o.block_id IS NULL
) AS main
ORDER BY 
    main.action_timestamp DESC, main.reminder_timestamp DESC;

`,[user_id]);

    res.status(200).json(query.rows);
  } catch (error) {
    throw error;
  }
};

//Get all the returned grievance
export const Get_Returned_Grievance_L1 = async (req, res) => {
  try {
    console.log("Inside the get returned function");
    const user_id = req.user.user_id;

    // Fetching grievances with action code 8 for the district officer
    const result = await pool.query(`
      SELECT 
          g.*,
          a_l.action_timestamp,
          a_l.action_code_id
      FROM grievances g
      JOIN action_log a_l ON a_l.grievance_id = g.grievance_id
      JOIN officer_info o ON o.district_id = g.district_id
      WHERE a_l.action_code_id = 8 AND o.officer_id = $1
    `, [user_id]);
    console.log(result)
    const grievances = result.rows;
    console.log(grievances);

    if (grievances.length === 0) {
      console.log("No returned grievances found.");
      return res.json([]);
    }

    // Get all grievance IDs to fetch media in one go
    const grievanceIds = grievances.map(g => g.grievance_id);

    // Fetch all media related to these grievances in one call
    const mediaDocs = await Grievance_Media.find({
      grievanceId: { $in: grievanceIds }
    });

    // Group media by grievance_id for easier mapping
    const mediaMap = mediaDocs.reduce((acc, item) => {
      if (!acc[item.grievanceId]) {
        acc[item.grievanceId] = { images: [], documents: [] };
      }
      if (item.image) acc[item.grievanceId].images.push(item.image);
      if (item.document) acc[item.grievanceId].documents.push(item.document);
      return acc;
    }, {});

    // Attach media to grievances
    const grievancesWithMedia = grievances.map((grievance) => ({
      ...grievance,
      media: mediaMap[grievance.grievance_id] || { images: [], documents: [] }
    }));

    console.log("Final grievances with media: ", grievancesWithMedia);
    res.json(grievancesWithMedia);
    
  } catch (error) {
    console.error("Error fetching returned grievances:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//get count
export const Get_Returned_Grievance_Count_L1 = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    console.log("Inside the get returned grievance count function.");
    const result = await officer.display_returned_grievance(user_id);

    res.status(200).json({count : result});
  } catch (error) {
    throw (error);
  }
}

//getGrievanceBased ON Grievance_ID
export const Get_Grievance_Based_On_Grievance_id_L1 = async (req, res) => {
  const { grievance_id } = req.query;
  const user_id = req.user.user_id;

  console.log("Grievance ID:", grievance_id);

  try {
    // Fetch the grievance from the database
    const result = await pool.query(
      `SELECT g.grievance_id, g.title, g.description, g.created_at
       FROM grievances g
       JOIN officer_info o ON o.district_id = g.district_id
       WHERE o.officer_id = $1 AND g.grievance_id = $2`,
      [user_id, grievance_id]
    );

    console.log(user_id, grievance_id);

    // Check if the grievance is found
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Get the first grievance from the result
    const grievance = result.rows[0];

    // Fetch media from MongoDB (assuming grievance_id is stored as grievanceId)
    const media = await Grievance_Media.find({ grievanceId: grievance.grievance_id });

    const images = media
          .filter((item) => item.image)
          .map((item) => item.image);

        const documents = media
          .filter((item) => item.document)
          .map((item) => item.document);
    // Build the response
    const response = {
      ...grievance,
      grievance_media: {
        images,
        documents
      }
    };

    // Send the response
    res.status(200).json(response);

  } catch (error) {
    console.error("Error fetching grievance:", error);
    res.status(500).json({ error: error.message });
  }
};

// Controller function to update viewed status

export const updateNotificationStatus = async (req, res) => {
  const { grievance_id } = req.body;
  console.log("Inside the updateNotificationStatus");
  try {
    // Update the status to true
    const result = await pool.query(
      `UPDATE reminders SET viewed = true WHERE grievance_id = $1 RETURNING *`,
      [grievance_id]
    );

    if (result.rows.length > 0) {
      res.status(200).json({ message: 'Notification status updated successfully.' });
    } else {
      res.status(404).json({ message: 'Notification not found.' });
    }
  } catch (error) {
    console.error("Error updating notification status:", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};



// Level 2 Officer Services


export const getAssignedToMe = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const result = await pool.query(`
                                    SELECT 
                                        ga.assigned_at,
                                        g.grievance_id,
                                        g.title,
                                        g.description,
                                        g.created_at,
                                        b.block_name,
                                        s.school_name,
                                        u.name,
                                        COALESCE(latest_action.action_code_id, 0) AS latest_action_code_id  -- If no action exists, defaults to 0
                                    FROM grievance_assignment ga
                                    JOIN grievances g ON g.grievance_id = ga.grievance_id
                                    JOIN blocks b ON b.block_id = g.block_id
                                    JOIN school s ON g.school_id = s.school_id
                                    JOIN users u ON u.user_id = ga.assigned_by
                                    LEFT JOIN (
                                        -- Subquery to get the latest action for each grievance
                                        SELECT grievance_id, action_code_id
                                        FROM action_log
                                        WHERE action_timestamp = (
                                            SELECT MAX(action_timestamp)
                                            FROM action_log sub
                                            WHERE sub.grievance_id = action_log.grievance_id
                                        )
                                    ) latest_action ON latest_action.grievance_id = ga.grievance_id
                                    WHERE ga.assigned_to = $1
                                      AND NOT EXISTS (
                                          SELECT 1 
                                          FROM action_log sub_al
                                          WHERE sub_al.grievance_id = ga.grievance_id 
                                            AND sub_al.action_code_id IN (8, 9)
                                      );
    `, [user_id]);
    
      const grievanceRows = result.rows;

    // Attach MongoDB media
    const grievances = await Promise.all(
      grievanceRows.map(async (grievance) => {
        const media = await Grievance_Media.find({ grievanceId: grievance.grievance_id });
        
        // 🔎 Map images and documents into separate arrays
        const images = media
          .filter((item) => item.image)
          .map((item) => item.image);

        const documents = media
          .filter((item) => item.document)
          .map((item) => item.document);

        // 🔄 Structure the response object
        return {
          ...grievance,
          grievance_media: {
            images,
            documents
          }
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
        atr_id : grievance_id,
        document: documentPath,
        version
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
    // 🔎 Fetch grievances from PostgreSQL
    const result = await pool.query(
      `
                                  SELECT 
                                  g.grievance_id,
                                  g.title,
                                  g.description,
                                  u.name AS assigned_by,
                                  ga.assigned_at,
                                  COALESCE(latest_action.action_code_id, 0) AS latest_action_code_id
                              FROM grievance_assignment ga
                              JOIN grievances g ON g.grievance_id = ga.grievance_id
                              JOIN users u ON u.user_id = ga.assigned_by
                              LEFT JOIN (
                                  -- Subquery to fetch the latest action per grievance
                                  SELECT 
                                      grievance_id, 
                                      action_code_id
                                  FROM action_log
                                  WHERE (grievance_id, action_timestamp) IN (
                                      SELECT 
                                          grievance_id, 
                                          MAX(action_timestamp) 
                                      FROM action_log
                                      GROUP BY grievance_id
                                  )
                              ) latest_action ON latest_action.grievance_id = ga.grievance_id
                              WHERE ga.assigned_to = $1
                                AND (
                                    -- Checking if any action_code_id exists historically
                                    EXISTS (
                                        SELECT 1 
                                        FROM action_log sub_al
                                        WHERE sub_al.grievance_id = ga.grievance_id 
                                          AND sub_al.action_code_id IN (3, 5, 6, 9)
                                    ) 
                                    OR latest_action.action_code_id IS NULL
                                );

      `,
      [user_id]
    );

    const grievanceRows = result.rows;

    // 🔄 Attach MongoDB media and ATR versions
    const grievances = await Promise.all(
      grievanceRows.map(async (grievance) => {
        
        const media = await Grievance_Media.find({ grievanceId: grievance.grievance_id });

       
        const images = media.filter((item) => item.image).map((item) => item.image);
        const documents = media.filter((item) => item.document).map((item) => item.document);

       
        const atrVersions = await ATR_Media.find({ atr_id: grievance.grievance_id }).sort({ version: 1 });

       
        const ATR = atrVersions.map((atr) => ({
          version: [atr.version],  
          documents: atr.document ? [atr.document] : []
        }));

       
        return {
          ...grievance,
          grievance_media: {
            images,
            documents,
          },
          ATR,
        };
      })
    );

    res.json(grievances);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};


export const checkForReminderLevel2 = async (req, res) => {
  try {
    console.log("Inside the Reminder Function");
    const user_id = req.user.user_id;

    const query = await pool.query(
      `SELECT 
    main.action_id,
    main.grievance_id,
    main.officer_id,
    main.action_code,
    main.action_timestamp,
    main.title,
    main.description,
    main.created_at,
    main.level1_officer,
    main.complainant,
    main.reminder_id,
    main.reminder_timestamp,
    main.viewed,
    main.type
FROM (
    -- 🔔 Subquery for Reminders (Level 2 Officer)
    SELECT 
        DISTINCT ON (g.grievance_id) 
        NULL AS action_id,
        g.grievance_id,
        g_a.assigned_to AS officer_id,
        'Reminder' AS action_code,
        r.reminder_timestamp AS action_timestamp,
        g.title,
        g.description,
        g.created_at,
        u1.name AS level1_officer,
        u2.name AS complainant,
        r.reminder_id,
        r.reminder_timestamp,
        r.viewed,
        'Reminder' AS type
    FROM 
        Grievances g
    JOIN 
        Grievance_assignment g_a ON g_a.grievance_id = g.grievance_id
    JOIN 
        Users u1 ON u1.user_id = g_a.assigned_by
    JOIN 
        Complainants c ON c.complainant_id = g.complainant_id
    JOIN 
        Users u2 ON u2.user_id = c.user_id
    LEFT JOIN 
        Reminders r ON r.grievance_id = g.grievance_id
    WHERE 
        g_a.assigned_to = $1
        AND r.reminder_id IS NOT NULL

    UNION ALL

    -- 🔔 Subquery for Notifications from Action Log (Level 2 Officer)
    SELECT 
        a.action_id,
        a.grievance_id,
        a.user_id AS officer_id,
        ac.code AS action_code,
        a.action_timestamp,
        g.title,
        g.description,
        g.created_at,
        u1.name AS level1_officer,
        u2.name AS complainant,
        NULL AS reminder_id,
        NULL AS reminder_timestamp,
        NULL AS viewed,
        'Notification' AS type
    FROM 
        Action_Log a
    JOIN 
        Action_Code ac ON a.action_code_id = ac.action_code_id
    JOIN 
        Grievance_assignment g_a ON g_a.grievance_id = a.grievance_id
    JOIN 
        Grievances g ON g.grievance_id = a.grievance_id
    JOIN 
        Users u1 ON u1.user_id = g_a.assigned_by
    JOIN 
        Complainants c ON c.complainant_id = g.complainant_id
    JOIN 
        Users u2 ON u2.user_id = c.user_id
    WHERE 
        a.action_code_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9)
        AND g_a.assigned_to = $1
        
) AS main
ORDER BY 
    main.action_timestamp DESC, main.reminder_timestamp DESC;
`, [user_id]
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


      return res.status(200).json({ count : reminders });
  } catch (error) {
      console.error("Error counting notifications:", error);
      return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const Return_Grievance = async (req, res) => {
  
  try {
  await pool.query('BEGIN');

  await pool.query(`
    DELETE FROM grievance_assignments 
    WHERE assigned_to = $1 AND grievance_id = $2
  `, [user_id, grievance_id]);

  await pool.query(`
    DELETE FROM action_log 
    WHERE user_id = $1 AND action_code_id IN (2, 9)
  `, [user_id]);

  await pool.query('COMMIT');
  console.log("Records deleted successfully.");
} catch (error) {
  await pool.query('ROLLBACK');
  console.error("Transaction failed: ", error);
  throw error;
}

}




//show atr uploaded by level 2 officer

export const Display_ATR_L2 = async (req, res, next) => {
  try {
    console.log("Inside the display_atr function");
    const user_id = req.user.user_id;
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


export const Get_Returned_Grievance_L2 = async (req, res) => {
  try {
    console.log("Inside the get returned function");
    const user_id = req.user.user_id;

    // 🚀 Fetching grievances with action code 8 for the district officer
    const result = await pool.query(`
      SELECT 
          g.*,
          a_l.action_timestamp,
          a_l.action_code_id
      FROM grievances g
      JOIN action_log a_l ON a_l.grievance_id = g.grievance_id
      JOIN grievance_assignment g_a ON g_a.grievance_id = g.grievance_id
      WHERE a_l.action_code_id = 8 AND g_a.assigned_to = $1
    `, [user_id]);
    console.log(result)
    const grievances = result.rows;
    console.log(grievances);

    if (grievances.length === 0) {
      console.log("No returned grievances found.");
      return res.json([]);
    }

    // Get all grievance IDs to fetch media in one go
    const grievanceIds = grievances.map(g => g.grievance_id);

    // Fetch all media related to these grievances in one call
    const mediaDocs = await Grievance_Media.find({
      grievanceId: { $in: grievanceIds }
    });

    // Group media by grievance_id for easier mapping
    const mediaMap = mediaDocs.reduce((acc, item) => {
      if (!acc[item.grievanceId]) {
        acc[item.grievanceId] = { images: [], documents: [] };
      }
      if (item.image) acc[item.grievanceId].images.push(item.image);
      if (item.document) acc[item.grievanceId].documents.push(item.document);
      return acc;
    }, {});

    // Attach media to grievances
    const grievancesWithMedia = grievances.map((grievance) => ({
      ...grievance,
      media: mediaMap[grievance.grievance_id] || { images: [], documents: [] }
    }));

    console.log("Final grievances with media: ", grievancesWithMedia);
    res.json(grievancesWithMedia);
    
  } catch (error) {
    console.error("Error fetching returned grievances:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//get count
export const Get_Returned_Grievance_Count_L2 = async (req, res, next) => {
  const user_id = req.user.user_id;
  try {
    console.log("Inside the get returned grievance count function.");
    const result = await officer.display_returned_grievance_l2(user_id);

    res.status(200).json({count : result});
  } catch (error) {
    throw (error);
  }
}

//getGrievanceBased ON Grievance_ID
export const Get_Grievance_Based_On_Grievance_id_L2 = async (req, res,next) => {
  const { grievance_id } = req.query;
  const user_id = req.user.user_id;

  console.log("Grievance ID:", grievance_id);

  try {
    // Make sure to include grievance_id in the SELECT to use it later
    const result = await pool.query(
      `SELECT g.grievance_id, g.title, g.description, g.created_at
       FROM grievances g
       JOIN officer_info o ON o.block_id = g.block_id
       WHERE o.officer_id = $1 AND g.grievance_id = $2`,
      [user_id, grievance_id]
    );

    console.log(user_id, grievance_id);

    // Check if the grievance is found
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Get the first grievance from the result
    const grievance = result.rows[0];

    // Fetch media from MongoDB (assuming grievance_id is stored as grievanceId)
    const media = await Grievance_Media.findOne({ grievanceId: grievance.grievance_id });

    // Build the response
    const response = {
      ...grievance,
      media: media ? {
        images: Array.isArray(media.image) ? media.image : [media.image], // Ensuring it's an array
        documents: Array.isArray(media.document) ? media.document : [media.document] // Ensuring it's an array
      } : {
        images: [],
        documents: []
      }
    };

    // Send the response
    res.status(200).json(response);

  } catch (error) {
    console.error("Error fetching grievance:", error);
    res.status(500).json({ error: error.message });
  }
}

export const Get_Disposed_L2 = async(req, res) => {
  try {
    console.log("Inside get disposed function.");

    const user_id = req.user.user_id;
    console.log(user_id);
     const result = await pool.query(`
                                    SELECT 
                                      g.grievance_id,
                                      g.title,
                                      g.description,
                                      g.created_at AS submission_time,
                                      a_l.action_timestamp AS disposed_time
                                    FROM grievances g
                                    JOIN action_log a_l ON a_l.grievance_id = g.grievance_id
                                    JOIN grievance_assignment g_a ON g_a.grievance_id = g.grievance_id
                                    WHERE a_l.action_code_id = 7 AND g_a.assigned_to = $1
                                    ORDER BY a_l.action_timestamp DESC
`, [user_id]);

const grievances = [];

for (const row of result.rows) {
  // Fetch all media associated with the grievance
  const media = await Grievance_Media.find({ grievanceId: row.grievance_id });

  // Separate images and documents
  const images = media.filter(m => m.image).map(m => m.image);
  const documents = media.filter(m => m.document).map(m => m.document);

  // Fetch all ATR media associated with the grievance (assuming multiple ATR documents are possible)
  const atrMedia = await ATR_Media.find({ atr_id: row.grievance_id });

  grievances.push({
    grievance_id: row.grievance_id,
    title: row.title,
    description: row.description,
    submission_time: row.submission_time,
    disposed_time: row.disposed_time,
    grievance_media: {
      images: images,
      documents: documents
    },
    final_atr_report: atrMedia.length > 0 ? atrMedia.map(atr => ({
      document: atr.document,
      uploaded_time: atr._id.getTimestamp()
    })) : null
  });
}

// return grievances;
console.log(grievances);

res.status(200).json(grievances);

  } catch (error) {
    throw (error);
  }
}
