import pool from '../config/db.js'

class Officer{
    async checkForReminderLevel1(user_id){
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
              JOIN officer_info o ON o.officer_id = $
              JOIN Grievances g ON g.grievance_id = a.grievance_id
              JOIN Grievance_assignments g_a ON g_a.grievance_id = g.grievance_id
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
};

export default Officer;