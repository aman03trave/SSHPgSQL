import pool from '../config/db.js'

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
              JOIN officer_info o ON o.officer_id = $1
              JOIN Grievances g ON g.grievance_id = a.grievance_id
              JOIN Grievance_assignment g_a ON g_a.grievance_id = g.grievance_id
              JOIN Users u1 ON u1.user_id = g_a.assigned_to
              JOIN Complainants c on c.complainant_id = g.complainant_id
              JOIN Users u2 ON u2.user_id = c.user_id
              WHERE a.action_code_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9) AND o.block_id IS NULL
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
              JOIN officer_info o ON o.officer_id = $1
              JOIN Grievances g ON g.grievance_id = a.grievance_id
              JOIN Grievance_assignment g_a ON g_a.grievance_id = g.grievance_id
              JOIN Users u1 ON u1.user_id = g_a.assigned_by
              JOIN Complainants c on c.complainant_id = g.complainant_id
              JOIN Users u2 ON u2.user_id = c.user_id
              WHERE a.action_code_id IN (2,3,4,5,6,7,8,9)
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

    const grievanceRows = result.rowCount;

    return grievanceRows;
      }
      catch(error){
        throw (error);
      }
    }

    async get_disposed(user_id) {
      try {
    const query = await pool.query(`
                                  SELECT g.grievance_id,
                                  g.title,
                                  g.description,
                                  a_l.action_timestamp
                                  
                                  FROM officer_info o
                                  JOIN grievances g ON o.district_id = g.district_id
                                  JOIN action_log a_l ON o.officer_id = a_l.user_id
                                  WHERE a_l.action_code_id = 7 AND o.officer_id = $1`, [user_id]);
     return query.rowCount;
  } catch (error) {
    throw (error);
  }
    }


};

export default Officer;