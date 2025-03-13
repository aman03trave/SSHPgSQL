import {RegisterUser, getRole_id, Login} from '../controllers/user.controller.js';
import express from 'express';

const expressRouter = express.Router();

expressRouter.post('/register', RegisterUser);
expressRouter.get('/role', getRole_id);
expressRouter.post('/login', Login);

export default expressRouter;
