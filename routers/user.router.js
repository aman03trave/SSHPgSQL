import {RegisterUser} from '../controllers/user.controller.js';
import express from 'express';

const expressRouter = express.Router();

expressRouter.post('/register', RegisterUser);

export default expressRouter;
