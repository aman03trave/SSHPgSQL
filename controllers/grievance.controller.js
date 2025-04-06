import Grievances from "../services/grievance.service.js";

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
