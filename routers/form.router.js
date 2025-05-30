import {GetDistricts, getBlocks, getSchools, Complainant_Category, Grievance_Category, Identity_Proof, getUserProfile, ForgetPassword} from '../controllers/form.controller.js';
import {authenticateUser} from '../middleware/authMiddleware.js';

import express from 'express';
const expressRouter = express.Router();

expressRouter.get('/districts', GetDistricts);
expressRouter.post('/blocks', getBlocks);
expressRouter.post('/schools', getSchools);
expressRouter.get('/complainant_category', Complainant_Category);
expressRouter.get('/identity_proof', Identity_Proof);
expressRouter.get('/grievance_category', Grievance_Category);
expressRouter.post('/forgetPassword', ForgetPassword);

// // protected routes
expressRouter.post('/userProfile', authenticateUser, getUserProfile);


export default expressRouter;