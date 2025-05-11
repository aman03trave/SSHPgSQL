import bodyParser from "body-parser";
import express from "express";
import { add_Officer, getGrievancesByDistrict, getBlockOfficersWithGrievanceCount, assignGrievance, getAssignedGrievances, reviewATR, getAssignedToMe, getAcceptedGrievance, uploadATR, checkForReminderLevel1, checkForReminderLevel2, L1_countUserNotification, L2_countUserNotification, Get_Disposed, get_disposed_count, get_New_Grievance_Count, getAssignedGrievanceCount, Return_Grievance } from "../controllers/officer.controller.js";
import e from "cors";
import { verifyToken } from "../middleware/verifytokenMiddleware.js";
import upload from '../middleware/uploadPic.js';

const expressRouter = express.Router();

// expressRouter.use(bodyParser);
//Level1 Endpoints
expressRouter.post('/add_Officer', add_Officer);
expressRouter.get('/getGrievancesByDistrict', verifyToken, getGrievancesByDistrict);
expressRouter.get('/getBlockOfficersWithGrievanceCount', verifyToken, getBlockOfficersWithGrievanceCount);
expressRouter.post('/assignGrievance', verifyToken, assignGrievance);
expressRouter.get('/getAssignedGrievance',verifyToken, getAssignedGrievances);
expressRouter.post('/reviewATR',verifyToken, reviewATR);
expressRouter.get('/getRemindersL1', verifyToken, checkForReminderLevel1);
expressRouter.get('/displayL1notifcount', verifyToken, L1_countUserNotification);
expressRouter.get('/get_disposed', verifyToken, Get_Disposed);
expressRouter.get('/get_disposed_count', verifyToken, get_disposed_count);
expressRouter.get('/get_New_Grievance_Count', verifyToken, get_New_Grievance_Count);
expressRouter.get('/getAssignedGrievanceCount', verifyToken, getAssignedGrievanceCount);



//Level2 Endpoints
expressRouter.get('/getAssignedToMe',verifyToken, getAssignedToMe);
expressRouter.get('/getAcceptedGrievance',verifyToken, getAcceptedGrievance);
expressRouter.post(
    "/uploadATR",
    verifyToken,
    upload.fields([{ name: "atr" }]),
    uploadATR
  );
expressRouter.get('/getRemindersL2', verifyToken, checkForReminderLevel2);
expressRouter.get('/displayL2notifcount', verifyToken, L2_countUserNotification);
expressRouter.get('/return_grievance', verifyToken, Return_Grievance);


export default expressRouter;
