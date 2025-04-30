import express from "express";
import { addGrievance, getGrievance, checkReminderEligibility, addReminder, getReminderStatus, addActionLog } from "../controllers/grievance.controller.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import {verifyToken} from '../middleware/verifytokenMiddleware.js'
import upload from '../middleware/uploadPic.js';
import { getGrievanceById } from '../controllers/grievance.controller.js';


const router = express.Router();


router.post("/addgrievance", verifyToken, upload.fields([{ name: "image" }, { name: "document" }]), addGrievance);
router.get('/getgrievance', verifyToken, getGrievance);
//for user
router.get('/checkReminder', verifyToken, checkReminderEligibility);
router.post('/addReminder', verifyToken, addReminder);
router.get('/getReminder', verifyToken, getReminderStatus);
router.get('/grievance_id',verifyToken,getGrievanceById);

export default router;