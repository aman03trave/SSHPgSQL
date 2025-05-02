import pool from '../config/db.js';
import Grievance_Media from '../model/grievance_media.model.js';

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
    async addGrievance(user_id, complainant_id, grievance_category_id, title, description, block_id, school_id, district_id) {
        try {
            const re = await pool.query('SELECT COUNT(*) FROM grievances');
            const count = parseInt(re.rows[0].count, 10);
            const grievance_id = `G-${1000 + count + 1}`;

            const result = await pool.query(
                `INSERT INTO Grievances(grievance_id, complainant_id, grievance_category_id, title, description, district_id, block_id, school_id) 
                 VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING grievance_id`,
                [grievance_id, complainant_id, grievance_category_id, title, description, district_id, block_id, school_id]
            );

            await this.addAction(grievance_id, user_id, 1);
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
            const result = await pool.query(`
                SELECT g.*, a.*, ac.*
                FROM Grievances g
                LEFT JOIN action_log a ON g.grievance_id = a.grievance_id
                LEFT JOIN action_code ac ON a.action_code_id = ac.action_code_id
                WHERE g.complainant_id = $1
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

    async ReminderEligibility(user_id) {
        try {
            const result = await pool.query(`
                SELECT 
                    g.grievance_id,
                    g.title,
                    g.description
                FROM Grievances g
                JOIN Complainants c ON g.complainant_id = c.complainant_id
                LEFT JOIN Reminders r ON g.grievance_id = r.grievance_id AND r.user_id = c.user_id
                LEFT JOIN action_log a ON g.grievance_id = a.grievance_id
                WHERE c.user_id = $1
                GROUP BY g.grievance_id, g.title, g.description, c.user_id
                HAVING (
                    MAX(a.action_timestamp) IS NULL OR 
                    AGE(NOW(), MAX(a.action_timestamp)) > INTERVAL '6 hours'
                ) AND (
                    MAX(r.reminder_timestamp) IS NULL OR 
                    AGE(NOW(), MAX(r.reminder_timestamp)) > INTERVAL '6 hours'
                )
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
                `INSERT INTO Reminders(reminder_id, grievance_id, user_id) VALUES($1, $2, $3)`,
                [reminder_id, grievanceId, user_id]
            );
            return result.rows[0];
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
}

export default Grievances;
