import bodyParser from "body-parser";
import express from "express";
import { add_Officer, getGrievancesByDistrict, getBlockOfficersWithGrievanceCount, assignGrievance, getAssignedGrievances, reviewATR, getAssignedToMe, uploadATR } from "../controllers/officer.controller.js";
import e from "cors";
import { verifyToken } from "../middleware/verifytokenMiddleware.js";

const expressRouter = express.Router();

// expressRouter.use(bodyParser);
expressRouter.post('/add_Officer', add_Officer);
expressRouter.get('/getGrievancesByDistrict', verifyToken, getGrievancesByDistrict);
expressRouter.get('/getBlockOfficersWithGrievanceCount', verifyToken, getBlockOfficersWithGrievanceCount);
expressRouter.post('/assignGrievance', assignGrievance);
expressRouter.get('/getAssignedGrievance', getAssignedGrievances);
expressRouter.post('/reviewATR', reviewATR);
expressRouter.get('/getAssignedToMe', getAssignedToMe);
expressRouter.post('/uploadATR', uploadATR);

export default expressRouter;
