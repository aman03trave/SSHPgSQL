import {RegisterUser, getRole_id, Login, refreshAccessToken, Logout, updateProfilePicture, getPicture} from '../controllers/user.controller.js';
import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { verifyToken } from '../middleware/verifytokenMiddleware.js';
import pool from '../config/db.js';
import upload from '../middleware/uploadPic.js';
import { updateUserProfile, handleGetUserProfile} from "../controllers/user.controller.js";

const expressRouter = express.Router();

expressRouter.post('/register', RegisterUser);
expressRouter.get('/role', getRole_id);
expressRouter.post('/login', Login);

expressRouter.post('/logout', Logout);

expressRouter.post('/refresh', refreshAccessToken);

expressRouter.get('/dashboard', verifyToken, async(req, res) => {


    try {
        const result = await pool.query('SELECT name FROM users WHERE user_id = $1', [req.user.user_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        const name = result.rows[0].name;

        res.json({ status: true, message: 'Welcome to Dashboard', user: req.user, name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Server error' });
    }
});

expressRouter.put("/update-profile",verifyToken, updateUserProfile);

expressRouter.get('/get-profile',verifyToken, handleGetUserProfile);

expressRouter.post('/update-profile-picture', verifyToken, upload.single('profile_picture'), updateProfilePicture);


export default expressRouter;
