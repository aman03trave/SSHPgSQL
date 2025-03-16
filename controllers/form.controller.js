import Forms from '../services/form.service.js';


const form = new Forms();

export const GetDistricts = async (req, res, next ) => {
    try {
        const districts = await form.getDistricts();
        res.json({ status: true, districts });
    } catch (error) {
        next(error);
    }
}

export const getBlocks = async(req, res, next) => {
    try {
        const { district_id } = req.body;
        const blocks = await form.getBlocks(district_id);
        res.json({ status: true, blocks });
    } catch (error) {
        next(error);
    }
}

export const getSchools = async(req, res, next) => {
    try {
        const { block_id } = req.params;
        const schools = await form.getSchools(block_id);
        res.json({ status: true, schools });
    } catch (error) {
        next(error);
    }
}

