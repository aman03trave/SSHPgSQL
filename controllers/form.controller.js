import Forms from '../services/form.service.js';


const form = new Forms();

export const GetDistricts = async (req, res, next ) => {
    try {
        const districts = await form.getDistricts();
        // console.log(districts);
        res.json({ status: true, districts });
    } catch (error) {
        next(error);
    }
}

export const getBlocks = async(req, res, next) => {
    try {
        const { district_name } = req.body;
        const blocks = await form.getBlocks(district_name);
        res.json({ status: true, blocks });
    } catch (error) {
        next(error);
    }
}

export const getSchools = async(req, res, next) => {
    try {
        const { block_id } = req.body;
        const schools = await form.getSchools(block_id);
        res.json({ status: true, schools });
    } catch (error) {
        next(error);
    }
}

export const Complainant_Category = async(req, res, next) => {
    try {
        const complainant_category = await form.getComplainant_Category();
        console.log("Data received:", complainant_category);
        // const categoryNames = complainant_category.map(category => category.category_name);
        res.json({ status: true, complainant_category});
    } catch (error) {
        next(error);
    }
}

export const Grievance_Category = async(req, res, next) => {
    try {
        const grievance_category = await form.getgrievance_category();
        // console.log("Data received:", grievance_category);
        res.json({ status: true, grievance_category});
    } catch (error) {
        next(error);
    }
}

export const Identity_Proof = async(req, res, next) => {
    try {
        const identity_proof = await form.getIdentity_Proof();
        // console.log("Data received:", identity_proof);
        res.json({ status: true, identity_proof});
    } catch (error) {
        next(error);
    }
}

export const getUserProfile = async(req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const userProfile = await form.getUser_Profile(user_id);
        console.log("Data received:", userProfile);
        res.json({ status: true, userProfile });
    } catch (error) {
        next(error);
    }
}



