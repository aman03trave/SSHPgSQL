import express from "express";
import { addGrievance, getGrievance, addReminder, getReminderStatus, addActionLog, checkReminderEligibility } from "../controllers/grievance.controller.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import {verifyToken} from '../middleware/verifytokenMiddleware.js'
import upload from '../middleware/uploadPic.js';
// import { getGrievanceById } from '../controllers/grievance.controller.js';
import { grievanceStats } from "../controllers/grievance.controller.js";
import { getGrievanceById, countUserNotification, DisplayGrievancewithATR, DisplayLatestGrievance } from '../controllers/grievance.controller.js';


const router = express.Router();


router.post("/addgrievance", verifyToken, upload.fields([{ name: "image" }, { name: "document" }]), addGrievance);
router.get('/getgrievance', verifyToken, getGrievance);
//for user
router.get('/checkReminder', verifyToken, checkReminderEligibility);
router.post('/addReminder', verifyToken, addReminder);
router.get('/getReminder', verifyToken, getReminderStatus);
router.post('/addAction', verifyToken, addActionLog);
router.get('/grievance_id',verifyToken,getGrievanceById);
router.get('/grievanceStats',grievanceStats);
router.get('/countNotification', verifyToken, countUserNotification);
router.get('/displayATRWG', verifyToken, DisplayGrievancewithATR);
router.get('/displayL_G', verifyToken, DisplayLatestGrievance);

export default router;