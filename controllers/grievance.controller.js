import Grievances from "../services/grievance.service.js";
import pool from '../config/db.js';
import Grievance_Media from "../model/grievance_media.model.js";

const grievanceService = new Grievances();

export const addGrievance = async (req, res, next) => {
    try {
        const { grievance_category, title, description, block_id, school_id, district_name } = req.body;
        console.log(block_id, school_id, district_name);
        const user_id = req.user.user_id;

        // Fetch necessary IDs
        const complainant_id = await grievanceService.getComplainant(user_id);
        // const block_id = await grievanceService.getBlock(block_name);
        // const school_id = await grievanceService.getSchool(school_name);
        const district_id = await grievanceService.getDistrict(district_name);
        const grievance_category_id = await grievanceService.getgrievancecategory(grievance_category);

        // File Paths
        const imagePath = req.files["image"] ? req.files["image"][0].path : null;
        const documentPath = req.files["document"] ? req.files["document"][0].path : null;

        // Save grievance in MongoDB
        console.log(block_id);
        const grievance = await grievanceService.addGrievance(
            user_id, complainant_id, grievance_category_id, title, description, block_id, school_id, district_id
        );
        console.log(grievance);
        // Save image & document in MongoDB
        if (imagePath || documentPath) {
            await grievanceService.addGrievanceMedia(grievance, imagePath, documentPath);
        }

        res.json({ status: true, message: "Grievance added successfully", grievance });
    } catch (error) {
        next(error);
    }
};

export const getGrievance = async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const complainant_id = await grievanceService.getComplainant(user_id)
        const grievance = await grievanceService.getGrievance(complainant_id);
        res.json({ status: true, grievance });
    } catch (error) {
        next(error);
    }
}

export const grievanceStats = async (req, res) => {
    try {
      const stats = await grievanceService.grievanceStatsService();
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


// export const checkReminderEligibility = async (req, res) => {
//     const user_id = req.user.user_id;
//     try {
//         const result = await grievanceService.ReminderEligibility(user_id);
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

export const addReminder = async (req, res) => {
    const { grievanceId } = req.body;
    const user_id = req.user.user_id;
    try {
        const result = await grievanceService.addReminder(grievanceId, user_id);
        res.status(200).json({ message: 'Reminder added successfully', ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addActionLog = async (req, res) => {
    const user_id = req.user.user_id;
    const {grievance_id, action_code_id} = req.body;
    try {
        const result = await grievanceService.addAction(grievance_id, user_id, action_code_id);
        res.status(200).json(result);
    } catch (error) {
        throw(error);
        
    }
}

export const getReminderStatus = async (req, res) => {
    // const { grievance_id} = req.body;
    const user_id = req.user.user_id;
    try {
        const result = await grievanceService.getReminderStatus(user_id);
        console.log(result);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getGrievanceById = async (req, res) => {
    const { grievance_id } = req.query;
    console.log("Grievance ID:", grievance_id);  
  
    try {
      // Make sure to include grievance_id in the SELECT to use it later
      const result = await pool.query(
        `SELECT grievance_id, title, description, created_at
         FROM grievances
         WHERE grievance_id = $1`,
        [grievance_id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Grievance not found' });
      }
  
      const grievance = result.rows[0];
  
      // Fetch media from MongoDB (assuming grievance_id is stored as grievanceId)
      const media = await Grievance_Media.findOne({ grievanceId: grievance.grievance_id });
  
      const response = {
        ...grievance,
        media: media ? {
          image: media.image,
          document: media.document
        } : null
      };
  
      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching grievance:", error);
      res.status(500).json({ error: error.message });
    }
  };
  

  export const countUserNotification = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const reminders = await getReminderStatus(user_id);

        const count = reminders.filter(item => {
            return !(
                item.notification_type === 'Reminder Eligibility' &&
                item.can_send_reminder === false
            );
        }).length;
        

        return res.status(200).json({ count });
    } catch (error) {
        console.error("Error counting notifications:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

