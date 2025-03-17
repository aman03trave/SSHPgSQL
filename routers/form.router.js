import {GetDistricts, getBlocks, getSchools} from '../controllers/form.controller.js';


import express from 'express';
const expressRouter = express.Router();

expressRouter.get('/districts', GetDistricts);
expressRouter.get('/blocks', getBlocks);
expressRouter.get('/schools', getSchools);

export default expressRouter;