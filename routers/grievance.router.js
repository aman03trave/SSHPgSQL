import express from "express";
import { addGrievance, getGrievance, checkReminderEligibility, addReminder, getReminderStatus, addActionLog } from "../controllers/grievance.controller.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import {verifyToken} from '../middleware/verifytokenMiddleware.js'
import upload from '../middleware/uploadPic.js';


const router = express.Router();


router.post("/addgrievance", verifyToken, upload.fields([{ name: "image" }, { name: "document" }]), addGrievance);
router.get('/getgrievance', verifyToken, getGrievance);
//for user
router.get('/checkReminder', verifyToken, checkReminderEligibility);
router.post('/addReminder', verifyToken, addReminder);
router.get('/getReminder', verifyToken, getReminderStatus);
router.post('/addAction', verifyToken, addActionLog);

export default router;