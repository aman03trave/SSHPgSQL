import { logVisit } from "../controllers/log.controller.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

import express from "express";

const expressRouter = express.Router();

expressRouter.post("/visit", logVisit);

export default expressRouter;