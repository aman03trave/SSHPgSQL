import { logVisit } from "../controllers/log.controller.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

import express from "express";


const expressRouter = express.Router();

expressRouter.post("/dashboard/visit", authenticateUser, logVisit);

export default expressRouter;