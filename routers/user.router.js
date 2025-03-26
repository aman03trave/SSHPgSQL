import {RegisterUser, getRole_id, Login, refreshAccessToken, Logout} from '../controllers/user.controller.js';
import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';

const expressRouter = express.Router();

expressRouter.post('/register', RegisterUser);
expressRouter.get('/role', getRole_id);
expressRouter.post('/login', Login);
expressRouter.post('/refresh', refreshAccessToken);
expressRouter.post('/logout', Logout);

expressRouter.get('/dashboard', authenticateUser, (req, res) => {
    res.json({ status: true, message: 'Welcome to Dashboard', user: req.user });
});

export default expressRouter;
