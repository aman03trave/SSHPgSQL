import bodyParser from "body-parser";
import express from "express";
import { add_Officer, getGrievancesByDistrict, getBlockOfficersWithGrievanceCount, assignGrievance, getAssignedGrievances, reviewATR, getAssignedToMe, getAcceptedGrievance, uploadATR } from "../controllers/officer.controller.js";
import e from "cors";
import { verifyToken } from "../middleware/verifytokenMiddleware.js";
import upload from '../middleware/uploadPic.js';

const expressRouter = express.Router();

// expressRouter.use(bodyParser);
expressRouter.post('/add_Officer', add_Officer);
expressRouter.get('/getGrievancesByDistrict', verifyToken, getGrievancesByDistrict);
expressRouter.get('/getBlockOfficersWithGrievanceCount', verifyToken, getBlockOfficersWithGrievanceCount);
expressRouter.post('/assignGrievance', verifyToken, assignGrievance);
expressRouter.get('/getAssignedGrievance',verifyToken, getAssignedGrievances);
expressRouter.post('/reviewATR',verifyToken, reviewATR);
expressRouter.get('/getAssignedToMe',verifyToken, getAssignedToMe);
expressRouter.get('/getAcceptedGrievance',verifyToken, getAcceptedGrievance);
expressRouter.post('/uploadATR', verifyToken, upload.fields([{name: "atr"}]), uploadATR);

export default expressRouter;
