import express from "express";
import { addGrievance } from "../controllers/grievance.controller.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import {verifyToken} from '../middleware/verifytokenMiddleware.js'
import upload from '../middleware/uploadPic.js';


const router = express.Router();


router.post("/addgrievance", verifyToken, upload.fields([{ name: "image" }, { name: "document" }]), addGrievance);

export default router;
