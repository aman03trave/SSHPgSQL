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
            return res.status(401).json({ status: false, message: `User doesn't exist` });
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

        res.json({ status: true, message: 'User logged in successfully', accessToken, refreshToken });
    } 
    catch (err) {
        next(err);
    }
};

export const refreshAccessToken = async (req, res, next) => {
    try {
        const {refreshToken} = req.body; // Get token from cookie
        // req.cookies.refreshToken || req.headers["x-refresh-token"] ||
        // console.log(refreshToken);
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

            res.json({ status: true, message: 'New access token generated', newAccessToken });
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

export const updateUserProfile = async (req, res) => {
    try {
      const user_id = req.user.user_id;
      const { name, age, gender, phone } = req.body;
  
      // Check if required fields are provided
      if (!name || !age || !gender || !phone) {
        return res.status(400).json({ message: "All fields are required except email." });
      }
  
      // Call the service to update user profile
      const updatedUser = await user.updateUser(user_id, { name, age, gender, phone });
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ message: "Profile updated successfully", updatedUser });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };


export const handleGetUserProfile = async (req, res) => {
    const userId = req.user.user_id;
  
    try {
      const profile = await user.getUserProfile(userId);
  
      if (!profile) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({ user: profile });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };  