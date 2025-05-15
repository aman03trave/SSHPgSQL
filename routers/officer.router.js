import bodyParser from "body-parser";
import express from "express";
import { add_Officer, getGrievancesByDistrict, getBlockOfficersWithGrievanceCount, assignGrievance, getAssignedGrievances, reviewATR, getAssignedToMe, getAcceptedGrievance, uploadATR, checkForReminderLevel1, checkForReminderLevel2, L1_countUserNotification, L2_countUserNotification, get_disposed_count, get_New_Grievance_Count, getAssignedGrievanceCount, Return_Grievance, Display_ATR_L1, Display_ATR_L2, Display_ATR_L1_count, Get_Returned_Grievance_Count_L1, Get_Returned_Grievance_L1, Get_Grievance_Based_On_Grievance_id_L1, Get_Grievance_Based_On_Grievance_id_L2, Get_Disposed_L1, Get_Disposed_L2, Get_Returned_Grievance_L2 } from "../controllers/officer.controller.js";
import e from "cors";
import { verifyToken } from "../middleware/verifytokenMiddleware.js";
import upload from '../middleware/uploadPic.js';
// import { Get_Disposed_Details } from "../controllers/officer.controller.js";

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
expressRouter.get('/get_disposedl1', verifyToken, Get_Disposed_L1);
expressRouter.get('/get_disposed_count', verifyToken, get_disposed_count);
expressRouter.get('/get_New_Grievance_Count', verifyToken, get_New_Grievance_Count);
expressRouter.get('/getAssignedGrievanceCount', verifyToken, getAssignedGrievanceCount);
expressRouter.get('/returned_grievance', verifyToken, Get_Returned_Grievance_L1);
expressRouter.get('/get_returned_count', verifyToken, Get_Returned_Grievance_Count_L1);
expressRouter.get('/getATRL1', verifyToken, Display_ATR_L1);
expressRouter.get('/getATRL1count', verifyToken, Display_ATR_L1_count);
expressRouter.get('/get_grievance_idl1', verifyToken, Get_Grievance_Based_On_Grievance_id_L1);





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
expressRouter.get('/getATRL2', verifyToken, Display_ATR_L2);
expressRouter.get('/get_grievance_idl2', verifyToken, Get_Grievance_Based_On_Grievance_id_L2);
expressRouter.get('/get_disposedl2', verifyToken, Get_Disposed_L2);
expressRouter.get('/get_returnedGrievancel2', verifyToken, Get_Returned_Grievance_L2);

export default expressRouter;
