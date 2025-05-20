import pool from '../config/db.js'
import Grievance_Media from '../model/grievance_media.model.js';
import ATR_Media from '../model/atr_media.model.js';

class Officer{
    async CheckForReminderLevel1(user_id){
        try {
          console.log("Inside the Reminder Function");
      
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
      
          return query.rowCount;
        } catch (error) {
          throw error;
        }
      }
      
      
      async checkForReminderLevel2(user_id) {
        try {
          console.log("Inside the Reminder Function");
      
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
          console.log(query.rowCount);
          return query.rowCount;
        } catch (error) {
          throw error;
        }
      }


      async assignedGrievanceCount(user_id){
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

    return result.rowCount;
  } catch (err) {
    throw (err);
  }
      }


      async getNewGrievanceCount(user_id){
      try {
    // Get district ID for the officer
    console.log(user_id);
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

    console.log(result)

    return result.rowCount;

    
      }
      catch(error){
        throw (error);
      }
    }

    async get_disposed(user_id) {
      try {
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
    console.log(result);
     return result.rowCount;
  } catch (error) {
    throw (error);
  }
    }

  async display_returned_grievance(user_id) {
    try {
    console.log("Inside the get returned function");

    const result = await pool.query(`
                                    SELECT g.*,
                                    a_l.action_timestamp
                                    From grievances g
                                    JOIN action_log a_l ON a_l.grievance_id = g.grievance_id
                                    JOIN officer_info o ON o.district_id = g.district_id
                                    where a_l.action_code_id = 8 and o.officer_id = $1`, [user_id]);

    return result.rowCount;
    } catch (err){
      throw (err);
    }
  }

  async Display_ATR_L1 (user_id){
  try {
    console.log("Inside the display_atr function");
   
    const result = await pool.query(
                                     `
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
                                  grievance_assignment g_a ON g_a.grievance_id = g.grievance_id
                              JOIN 
                                  users u1 ON u1.user_id = g_a.assigned_to
                              LEFT JOIN atr_review a ON a.atr_id = a_r.grievance_id  -- ✅ Corrected join key
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
                                  
                                  AND NOT EXISTS (
                                      SELECT 1 
                                      FROM action_log sub_a_l 
                                      WHERE sub_a_l.grievance_id = g.grievance_id 
                                        AND sub_a_l.action_code_id IN (7, 4)
                                  );


                              `, [user_id]);
    
      return result.rowCount;

  } catch (error) {
    throw (error);
  }
}

async display_returned_grievance_l2(user_id){
  try {
    console.log("Inside the get returned function");

    const result = await pool.query(`
                                    SELECT g.*,
                                    a_l.action_timestamp
                                    From grievances g
                                    JOIN action_log a_l ON a_l.grievance_id = g.grievance_id
                                    JOIN officer_info o ON o.block_id = g.block_id
                                    where a_l.action_code_id = 8 and o.officer_id = $1`, [user_id]);

    return result.rowCount;
    } catch (err){
      throw (err);
    }
}

async DisplayAtrCountL2(user_id) {
  try {

    const result = await pool.query(`
                                    SELECT g.title,
                                    g.description,
                                    u.name
                                    FROM grievances g
                                    JOIN atr_reports a_r ON a_r.grievance_id = g.grievance_id
                                    JOIN grievance_assignment g_a ON g_a.grievance_id = g.grievance_id
                                    JOIN Users u ON u.user_id = g_a.assigned_by
                                    where g_a.assigned_to = $1`, [user_id]);
    return result.rowCount;
    
  } catch (error) {
    throw (error);
  }
  
}

async DisplayReturn_GrievanceCountL2(user_id){
  try {
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

    return result.rowCount;
  } catch (error) {
    throw (error);
  }
}

async Get_Disposed_L2Count(user_id){
  try {
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

return result.rowCount;
  } catch (error) {
    throw (error);
  }
}

};



export default Officer;
