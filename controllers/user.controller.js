import Users from '../services/user.service.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { setTokenCookie } from '../utils/cookieHelper.js';


const user = new Users();

export const RegisterUser = async ( req, res, next ) => {
    try {
        const { name, gender, age, phone, email, password, role_name, category } = req.body;
        const role_id = await user.getRole_id(role_name);
        const category_id = await user.findCategory(category);
        await user.createUser(name, gender, age, phone, email, password, role_id, category_id);
        res.json({ status: true, message: 'User registered successfully' });
    } catch (err) {
        next(err);
    }
};

export const getRole_id = async (req, res, next) => {
    try{
        const { role_name } = req.body;
        const role_id = await user.getRole_id(role_name);
        res.json({ status: true, role_id });
    }
    catch (err) {
        next(err);
    }

};

dotenv.config();

export const Login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const userAuth = await user.findUser(email);
        if (!userAuth) {
            return res.status(401).json({ status: false, message: 'Invalid email or password' });
        }

        // Compare password securely
        const match = await bcrypt.compare(password, userAuth.password);
        if (!match) {
            return res.status(401).json({ status: false, message: 'Invalid email or password' });
        }

        // Generate JWT access token
        const accessToken = jwt.sign(
            { user_id: userAuth.user_id, role_id: userAuth.role_id, email: userAuth.email },
            process.env.JWT_SECRET, 
            { expiresIn: '15m' } // Short expiry for security
        );

        // Generate refresh token
        const refreshToken = jwt.sign(
            { user_id: userAuth.user_id },
            process.env.JWT_REFRESH_SECRET, 
            { expiresIn: '7d' } // Longer expiry
        );

        // Store tokens in secure cookies
        setTokenCookie(res, accessToken, refreshToken);

        res.json({ status: true, message: 'User logged in successfully' });
    } 
    catch (err) {
        next(err);
    }
};

export const refreshAccessToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken; // Get token from cookie

        if (!refreshToken) {
            return res.status(403).json({ status: false, message: 'Refresh token required' });
        }

        // Verify refresh token
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ status: false, message: 'Invalid refresh token' });
            }

            // Generate a new access token
            const newAccessToken = jwt.sign(
                { user_id: decoded.user_id },
                process.env.JWT_SECRET, 
                { expiresIn: '15m' }
            );

            // Store new access token in cookie
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'Strict',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });

            res.json({ status: true, message: 'New access token generated' });
        });
    } catch (err) {
        next(err);
    }
};

export const Logout = async (req, res, next) => {
    try {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ status: true, message: 'Logged out successfully' });
    } catch (err) {
        next(err);
    }
};
