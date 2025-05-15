import pool from '../config/db.js'
import Grievance_Media from '../model/grievance_media.model.js';
import ATR_Media from '../model/atr_media.model.js';

class Officer{
    async CheckForReminderLevel1(user_id){
        try {
          console.log("Inside the Reminder Function");
      
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
              JOIN Grievances g ON g.grievance_id = a.grievance_id
              JOIN Grievance_assignment g_a ON g_a.grievance_id = g.grievance_id
              JOIN Users u1 ON u1.user_id = g_a.assigned_to
              JOIN Complainants c on c.complainant_id = g.complainant_id
              JOIN Users u2 ON u2.user_id = c.user_id
              WHERE g_a.assigned_by = $1 and a.action_code_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9)
              ORDER BY a.action_timestamp DESC`, [user_id]
          );
      
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
        JOIN grievance_assignment  g_a ON g_a.grievance_id = a.grievance_id
        JOIN Grievances g ON g.grievance_id = a.grievance_id
        JOIN Users u1 ON u1.user_id = g_a.assigned_by
        JOIN Complainants c on c.complainant_id = g.complainant_id
        JOIN Users u2 ON u2.user_id = c.user_id
        WHERE a.action_code_id IN (2,3,4,5,6,7,8,9) and g_a.assigned_to = $1
        ORDER BY a.action_timestamp DESC`, [user_id]
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
   
    const result = await pool.query(`
                                    SELECT 
                                    g.title,
                                    g.description,
                                    u1.name AS officer_name,
                                    g.grievance_id,
                                    ac.action_code_id
                                FROM 
                                    grievances g
                                JOIN 
                                    atr_reports a_r ON a_r.grievance_id = g.grievance_id
                                JOIN 
                                    atr_review a ON a.atr_id = a_r.grievance_id
                                JOIN 
                                    grievance_assignment g_a ON g_a.grievance_id = g.grievance_id
                                JOIN 
                                    Users u1 ON u1.user_id = g_a.assigned_to
                                JOIN 
                                    action_log a_l ON a_l.grievance_id = g.grievance_id
                                JOIN 
                                    action_code ac ON ac.action_code_id = a_l.action_code_id
                                WHERE 
                                    g_a.assigned_by = $1
                                    AND a.status = 'accepted'
                                    AND NOT EXISTS (
                                        SELECT 1 
                                        FROM action_log sub_a_l 
                                        WHERE sub_a_l.grievance_id = g.grievance_id 
                                          AND sub_a_l.action_code_id = 7
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

};



export default Officer;




export const getDisposedGrievancesWithDetailsService = async (user_id) => {
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

    const grievances = [];

    for (const row of result.rows) {
      const media = await Grievance_Media.find({ grievanceId: row.grievance_id });
      const atr = await ATR_Media.findOne({ atr_id: row.grievance_id });

      grievances.push({
        grievance_id: row.grievance_id,
        title: row.title,
        description: row.description,
        submission_time: row.submission_time,
        disposed_time: row.disposed_time,
        grievance_media: media.map(m => ({
          image: m.image,
          document: m.document
        })),
        final_atr_report: atr ? {
          document: atr.document,
          uploaded_time: atr._id.getTimestamp()
        } : null
      });
    }

    return grievances;
  } catch (error) {
    throw error;
  }
};
