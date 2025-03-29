import Grievances from "../services/grievance.service.js";
import {authenticateUser} from "../middleware/authMiddleware.js";

const form = new Grievances();

export const addG = async(req, res, next) =>{
    try {
        const { grievance_category, title, description, block_name, school_name, district_name } = req.body;
        const user_id = req.user.user_id;
        const complainant_id = await form.getComplainant(user_id);
        const block_id = await form.getBlock(block_name);
        const school_id = await form.getSchool(school_name);
        const district_id = await form.getDistrict(district_name);
        const grievance_category_id = await form.getgrievance_category(grievance_category);
        console.log(user_id, complainant_id, grievance_category_id, title, description, block_id, school_id, district_id)

        const grievance = await form.addGrievance(user_id, complainant_id, grievance_category_id, title, description, block_id, school_id, district_id);
        res.json({ status: true, message: 'Grievance added successfully', grievance });
    } catch (error) {
        next(error);
    }
}