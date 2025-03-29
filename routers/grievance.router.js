import { addG } from "../controllers/grievance.controller.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import express from 'express';

const expressRouter = express.Router();

expressRouter.post('/form/addGrievance', authenticateUser, addG);

export default expressRouter;