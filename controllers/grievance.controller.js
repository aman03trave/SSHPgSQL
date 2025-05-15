import Grievances from "../services/grievance.service.js";
import pool from '../config/db.js';
import Grievance_Media from "../model/grievance_media.model.js";

const grievanceService = new Grievances();

export const addGrievance = async (req, res, next) => {
  try {
    console.log("FILES RECEIVED:", Object.keys(req.files));

    const {
      grievance_category,
      title,
      description,
      block_id,
      school_id,
      district_name,
      is_public
    } = req.body;

    const user_id = req.user.user_id;

    // Fetching IDs for insertion
    const [complainant_id, district_id, grievance_category_id] = await Promise.all([
      grievanceService.getComplainant(user_id),
      grievanceService.getDistrict(district_name),
      grievanceService.getgrievancecategory(grievance_category)
    ]);

    console.log(user_id, complainant_id, grievance_category_id, title, description, block_id, school_id, district_id, is_public);

    // Creating Grievance
    const grievance = await grievanceService.addGrievance(
      user_id,
      complainant_id,
      grievance_category_id,
      title,
      description,
      block_id,
      school_id,
      district_id,
      is_public
    );

    // Handle Multiple Files
    const imagePaths = req.files["image"]?.map((file) => file.path) || [];
    const documentPaths = req.files["document"]?.map((file) => file.path) || [];

    // Inserting Media in Bulk
    const mediaPromises = [];

    imagePaths.forEach((imagePath) => {
      mediaPromises.push(grievanceService.addGrievanceMedia(grievance, imagePath, null));
    });

    documentPaths.forEach((documentPath) => {
      mediaPromises.push(grievanceService.addGrievanceMedia(grievance, null, documentPath));
    });

    await Promise.all(mediaPromises);

    console.log("Grievance Created Successfully:", grievance);
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
      const stats = await grievanceService.grievanceStats();
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


export const checkReminderEligibility = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        const result = await grievanceService.ReminderEligibility(user_id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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
  const user_id = req.user.user_id;

  console.log("Grievance ID:", grievance_id);

  try {
    // Make sure to include grievance_id in the SELECT to use it later
    const result = await pool.query(
      `SELECT g.grievance_id, g.title, g.description, g.created_at
       FROM grievances g
       JOIN Complainants c ON c.complainant_id = g.complainant_id
       WHERE c.user_id = $1 AND g.grievance_id = $2`,
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
};

  

  export const countUserNotification = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const reminders = await grievanceService.ReminderEligibility(user_id); // call correct function

        const count = reminders.reduce((total, item) => {
            if (item.notification_type === 'Reminder Eligibility' && !item.can_send_reminder) {
                return total;
            }
            return total + 1;
        }, 0);

        return res.status(200).json({ count });
    } catch (error) {
        console.error("Error counting notifications:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};



export const DisplayGrievancewithATR = async(req, res) => {
    try {
        // const {grievance_id} = req.body;
        const user_id = req.user.user_id;
        console.log(user_id);

        const result = await grievanceService.afterATRUpload(user_id);
        console.log(result);
        res.status(200).json(result);
    } catch (error) {
        throw (error);
    }
}

//display latest grievance to the officers

export const DisplayLatestGrievance = async(req, res) => {
    try {
        const user_id = req.user.user_id;

        const result = await grievanceService.displayLatestGrievance(user_id);
        console.log("Entered \n",result);

        res.status(200).json(result);

    } catch (error) {
        throw (error);
    }
}


//display all the public grievances

export const get_Public_Grievance = async(req, res) => {
    try{
        const user_id = req.user.user_id;
        const complainantId = await grievanceService.getComplainant(user_id);
        const result = await grievanceService.getPublicGrievance(complainantId);

        res.status(200).json(result);
    }catch (err){
        throw (err);
    }
}

//display all the action_log of a particular grievance_id

export const Display_Action_Log = async(req, res, next) => {
    try {
        const { grievance_id} = req.body;

        const result = await grievanceService.display_action_log(grievance_id);

        res.status(200).json(result);
    } catch (error) {
        throw (error);
    }
}