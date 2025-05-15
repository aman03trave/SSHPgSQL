import pool from '../config/db.js';
import Grievance_Media from '../model/grievance_media.model.js';
import ATR_Media from '../model/atr_media.model.js';

class Grievances {
    // Add action
    async addAction(grievance_id, user_id, action_code_id) {
        try {
            const result = await pool.query(
                `INSERT INTO ACTION_LOG(grievance_id, user_id, action_code_id) VALUES($1, $2, $3)`,
                [grievance_id, user_id, action_code_id]
            );
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error adding action : '${error}'`);
        }
    }

    // Add grievance
    async addGrievance(user_id, complainant_id, grievance_category_id, title, description, block_id, school_id, district_id, is_public) {
        try {
            const re = await pool.query('SELECT COUNT(*) FROM grievances');
            const count = parseInt(re.rows[0].count, 10);
            const grievance_id = `G-${1000 + count + 1}`;

            const result = await pool.query(
                `INSERT INTO Grievances(grievance_id, complainant_id, grievance_category_id, title, description, is_public, district_id, block_id, school_id) 
                 VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING grievance_id`,
                [grievance_id, complainant_id, grievance_category_id, title, description, is_public, district_id, block_id, school_id, ]
            );

            await this.addAction(grievance_id, user_id, 1);
            console.log(result.rows[0].grievance_id);
            return result.rows[0].grievance_id;
        } catch (error) {
            throw new Error(`Error lodging grievance : '${error}'`);
        }
    }

    async getComplainant(user_id) {
        try {
            const result = await pool.query('SELECT complainant_id FROM Complainants WHERE user_id = $1', [user_id]);
            return result.rows[0].complainant_id;
        } catch (error) {
            throw new Error(`Error getting user : '${error}'`);
        }
    }

    async getBlock(block_name) {
        try {
            const result = await pool.query('SELECT block_id FROM Blocks WHERE block_name = $1', [block_name]);
            return result.rows[0].block_id;
        } catch (error) {
            throw new Error(`Error getting block : '${error}'`);
        }
    }

    async getSchool(school_name) {
        try {
            const result = await pool.query('SELECT school_id FROM School WHERE school_name = $1', [school_name]);
            return result.rows[0].school_id;
        } catch (error) {
            throw new Error(`Error getting school : '${error}'`);
        }
    }

    async getDistrict(district_name) {
        try {
            const result = await pool.query('SELECT district_id FROM Districts WHERE district_name = $1', [district_name]);
            return result.rows[0].district_id;
        } catch (error) {
            throw new Error(`Error getting district : '${error}'`);
        }
    }

    async getgrievancecategory(grievance_category) {
        try {
            const result = await pool.query('SELECT * FROM grievance_category WHERE grievance_category_name = $1', [grievance_category]);
            return result.rows[0].grievance_category_id;
        } catch (error) {
            throw new Error(`Error getting grievance category : '${error}'`);
        }
    }

    async grievanceStats() {
        const query = `
          SELECT status, COUNT(*) as count FROM (
            SELECT a.grievance_id,
              CASE 
                WHEN a.action_code_id = 1 THEN 'Registered'
                WHEN a.action_code_id = 7 THEN 'Completed'
                ELSE 'InProcess'
              END AS status
            FROM Action_Log a
            INNER JOIN (
              SELECT grievance_id, MAX(action_timestamp) AS latest_time
              FROM Action_Log
              GROUP BY grievance_id
            ) latest ON a.grievance_id = latest.grievance_id AND a.action_timestamp = latest.latest_time
          ) latest_actions
          GROUP BY status
        `;
        const result = await pool.query(query);
        const stats = { Registered: 0, InProcess: 0, Completed: 0 };
        result.rows.forEach(row => {
            stats[row.status] = parseInt(row.count);
        });
        return stats;
    }

    async addGrievanceMedia(grievanceId, imagePath, documentPath) {
        const grievanceMedia = new Grievance_Media({
            grievanceId,
            image: imagePath,
            document: documentPath
        });
        await grievanceMedia.save();
        return grievanceMedia;
    }

    async getGrievance(complainantId) {
  try {
    const result = await pool.query(
      `
        SELECT 
            g.*,
            a_l.action_timestamp,
            ac.action_code_id,
            ac.code AS action_description
        FROM Grievances g
        LEFT JOIN LATERAL (
            SELECT 
                a.action_timestamp,
                a.action_code_id
            FROM action_log a
            WHERE a.grievance_id = g.grievance_id
            ORDER BY a.action_timestamp DESC
            LIMIT 1
        ) a_l ON true
        LEFT JOIN action_code ac ON a_l.action_code_id = ac.action_code_id
        WHERE g.complainant_id = $1;
      `,
      [complainantId]
    );

    const grievances = result.rows;

    // Attach MongoDB Media (Optimized Promise.all to run in parallel)
    const grievancesWithMedia = await Promise.all(
      grievances.map(async (grievance) => {
        const media = await Grievance_Media.find({ grievanceId: grievance.grievance_id });
        
        // Convert MongoDB response to an array of media
        const images = media.map((item) => item.image).filter(Boolean);
        const documents = media.map((item) => item.document).filter(Boolean);

        return {
          ...grievance,
          media: {
            images,
            documents
          }
        };
      })
    );

    return grievancesWithMedia;
  } catch (e) {
    throw new Error(`Error fetching grievance with media: ${e.message}`);
  }
}



    async ReminderEligibility(user_id) {
        try {
            const result = await pool.query(
                `SELECT * FROM (
    -- Reminder Eligibility Check
    SELECT 
    g.grievance_id,
    g.title,
    'Reminder Eligibility' AS notification_type,
    GREATEST(
        g.created_at + INTERVAL '2 hours',
        COALESCE(MAX(a.action_timestamp), g.created_at) + INTERVAL '2 hours',
        COALESCE(MAX(r.reminder_timestamp), g.created_at) + INTERVAL '2 hours'
    ) AS timestamp,
    (
        NOW() >= GREATEST(
            g.created_at + INTERVAL '2 hours',
            COALESCE(MAX(a.action_timestamp), g.created_at) + INTERVAL '2 hours',
            COALESCE(MAX(r.reminder_timestamp), g.created_at) + INTERVAL '2 hours'
        )
    ) AS can_send_reminder
FROM 
    Grievances g
JOIN 
    Complainants c ON g.complainant_id = c.complainant_id
LEFT JOIN 
    Reminders r ON g.grievance_id = r.grievance_id AND r.user_id = c.user_id
LEFT JOIN 
    action_log a ON g.grievance_id = a.grievance_id
WHERE 
    c.user_id = $1
GROUP BY 
    g.grievance_id, g.title, g.created_at, c.user_id


    UNION ALL

    -- Reminder Sent
    SELECT 
        r.grievance_id,
        g.title,
        'Reminder Sent' AS notification_type,
        r.reminder_timestamp AS timestamp,
        false AS can_send_reminder
    FROM 
        Reminders r
    JOIN 
        Grievances g ON g.grievance_id = r.grievance_id
    JOIN 
        Complainants c ON g.complainant_id = c.complainant_id
    WHERE 
        c.user_id = $1

    UNION ALL

    -- Action Log (e.g., assigned, verified)
    SELECT 
        a.grievance_id,
        g.title,
        ac.code AS notification_type,
        a.action_timestamp AS timestamp,
        false AS can_send_reminder
    FROM 
        Action_Log a
    JOIN 
        Action_Code ac ON ac.action_code_id = a.action_code_id
    JOIN 
        Grievances g ON g.grievance_id = a.grievance_id
    JOIN 
        Complainants c ON g.complainant_id = c.complainant_id
    WHERE 
        c.user_id = $1

    UNION ALL

    -- Grievance Assigned to Officer
    SELECT 
        ga.grievance_id,
        g.title,
        'Grievance Assigned to Officer' AS notification_type,
        ga.assigned_at AS timestamp,
        false AS can_send_reminder
    FROM 
        grievance_assignment ga
    JOIN 
        Grievances g ON g.grievance_id = ga.grievance_id
    JOIN 
        Complainants c ON g.complainant_id = c.complainant_id
    WHERE 
        c.user_id = $1

    UNION ALL

    -- ATR Generated
    SELECT 
        a.grievance_id,
        g.title,
        'ATR Generated' AS notification_type,
        a.created_at AS timestamp,
        false AS can_send_reminder
    FROM 
        atr_reports a
    JOIN 
        Grievances g ON g.grievance_id = a.grievance_id
    JOIN 
        Complainants c ON g.complainant_id = c.complainant_id
    WHERE 
        c.user_id = $1

    UNION ALL

    -- ATR Reviewed (Accepted/Rejected)
    SELECT 
        arw.atr_review_id::TEXT || '-' || g.grievance_id AS grievance_id,
        g.title,
        CONCAT('ATR ', arw.status) AS notification_type,
        arw.reviewed_at AS timestamp,
        false AS can_send_reminder
    FROM 
        atr_review arw
    JOIN 
        atr_reports atr ON arw.atr_id = atr.grievance_id
    JOIN 
        grievances g ON atr.grievance_id = g.grievance_id
    JOIN 
        complainants c ON g.complainant_id = c.complainant_id
    WHERE 
        c.user_id = $1
) AS notifications
ORDER BY timestamp DESC;


            `, [user_id]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error checking reminder eligibility: '${error}'`);
        }
    }

    async addReminder(grievanceId, user_id) {
        try {
            const remind = await pool.query(`SELECT COUNT(*) FROM Reminders`);
            const count = parseInt(remind.rows[0].count, 10);
            const reminder_id = count + 1;

            const result = await pool.query(
                `INSERT INTO Reminders(grievance_id, user_id) VALUES ($1, $2)
            `, [grievanceId, user_id]);
            return result.rows;
            
        } catch (error) {
            throw new Error(`Error adding reminder : '${error}'`);
        }
    }

    async getReminderStatus(user_id) {
        try {
            const result = await pool.query(`
                SELECT g.title, g.description, g.grievance_id, 
                    CASE 
                        WHEN (
                            (MAX(a.action_timestamp) IS NULL OR NOW() - MAX(a.action_timestamp) > INTERVAL '2 hours') AND
                            (MAX(r.reminder_timestamp) IS NULL OR NOW() - MAX(r.reminder_timestamp) > INTERVAL '2 hours')
                        ) THEN TRUE 
                        ELSE FALSE 
                    END AS can_send_reminder
                FROM Grievances g
                JOIN Complainants c ON g.complainant_id = c.complainant_id
                LEFT JOIN Reminders r ON g.grievance_id = r.grievance_id AND r.user_id = c.user_id
                LEFT JOIN action_log a ON g.grievance_id = a.grievance_id
                WHERE c.user_id = $1
                GROUP BY g.grievance_id, c.user_id
                HAVING MAX(r.reminder_timestamp) IS NOT NULL OR NOW() - MIN(g.created_at) > INTERVAL '2 hours'
            `, [user_id]);

            return result.rows;
        } catch (error) {
            throw new Error(`Error getting reminder status : '${error}'`);
        }
    }

    async afterATRUpload(user_id){
        try {
            console.log("Entered in the function");
    
            // Step 1: Fetch grievance with ATR report details (PostgreSQL)
            const results = await pool.query(`
                SELECT 
                    g.grievance_id,
                    g.title,
                    a.atr_id,
                    a.created_at AS atr_created_at,
                    a.generated_by,
                    a.version
                FROM 
                    grievances g
                JOIN 
                    atr_reports a ON g.grievance_id = a.grievance_id
                WHERE 
                    a.generated_by = $1
            `, [user_id]);
    
            // Step 2: Fetch ATR media from MongoDB (optional)
            const result  = results.rows;
            console.log(result.grievance_id);
            const atrMedia = await ATR_Media.find({ atr_id: result.map(row => row.grievance_id)
                 }); // Assuming atr_id matches grievance_id
    
            return {
                grievance: result,
                atr_media: atrMedia
            };
            
    
        } catch (error) {
            console.error("Error in afterATRUpload:", error);
            throw error;
        }
    }

    //Displaying the latest grievance lodged

    async displayLatestGrievance(user_id){
        console.log("Entered into the function");
        console.log(user_id);

        try {
            const query = await pool.query(`SELECT g.grievance_id,
                g.title,
                g.description,
                g.created_at
                
                FROM GRIEVANCES g

                JOIN 

                OFFICER_INFO o ON o.district_id = g.district_id

                WHERE o.officer_id = $1 and g.is_public = true

                ORDER BY 
                g.created_at desc
                LIMIT 5
                 `, [user_id]);
            console.log(query.rows);
            return query.rows;
        } catch (error) {
            throw (error);
        }
        
    }

    async getPublicGrievance(complainantId) {
        try {
            console.log(complainantId);
            const result = await pool.query(`
                SELECT g.*, a.*, ac.*
                FROM Grievances g
                LEFT JOIN (
                    SELECT DISTINCT ON (grievance_id) *
                    FROM action_log
                    ORDER BY grievance_id, action_timestamp DESC
                ) a ON g.grievance_id = a.grievance_id
                LEFT JOIN action_code ac ON a.action_code_id = ac.action_code_id
                WHERE g.is_public = 'true' and g.complainant_id != $1

            `, [complainantId]);

            const grievances = result.rows;

            const grievancesWithMedia = await Promise.all(
                grievances.map(async (grievance) => {
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

            return grievancesWithMedia;
        } catch (e) {
            throw new Error(`Error fetching grievance with media: ${e.message}`);
        }
    }

    //display all the action_log of a particular grievance_id

    async display_action_log(grievance_id){
        try {
            console.log("Inside the function.");

            const query = await pool.query(`SELECT 
                                    a_c.code,
                                    a.grievance_id,
                                    a.action_timestamp,
                                    users.name AS officer_name
                                FROM 
                                    action_log a
                                JOIN action_code a_c on a_c.action_code_id = a.action_code_id
                                JOIN 
                                    users ON a.user_id = users.user_id
                                WHERE 
                                    a.grievance_id = $1
                                ORDER BY 
                                    a.action_timestamp DESC;
                                `, [grievance_id])

            return query.rows;
        } catch (error) {
            throw (error);
        }
    }

}

    
export default Grievances;