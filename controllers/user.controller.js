import Users from '../services/user.service.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { setTokenCookie } from '../utils/cookieHelper.js';
import db from '../config/db.js';
const pool = db;


const user = new Users();

export const RegisterUser = async (req, res, next) => {
  try {
    const {
      name, gender, age, phone, email, password, role_name, category,
      identity_proof_id, identity_proof_number
    } = req.body;

    const role_id = await user.getRole_id(role_name);
    const category_id = await user.findCategory(category);
    await user.createUser(
       name, gender, age, phone, email, password, role_id, category_id,
      identity_proof_id, identity_proof_number
    );

    res.json({ status: true,name,message: 'User registered successfully' });
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
            { expiresIn: '1d' } // Short expiry for security
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
                { expiresIn: '1d' }
            );

            // Store new access token in cookie
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'Strict',
                maxAge: 24 * 60 * 60 * 1000 // 15 minutes 15 * 60
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
        res.status(200).json({ status: true, message: 'Logged out successfully' });
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

  // controllers/profileController.js

import UserProfile from '../model/profile_pic.model.js';

// Importing multer middleware

// Controller to handle the update of the profile picture
export const updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file uploaded" });
        }

        // User ID from the request (this can be fetched from the JWT token or session)
        const user_id = req.user.user_id; 

        // Get the image URL (path to the uploaded image on the server)
        const profile_pic = `/uploads/${req.file.filename}`;
        // console.log(imageUrl);

        // Check if the user already has a profile picture
        let profilePic = await UserProfile.findOne({ user_id });

        if (!profilePic) {
            // Create a new entry if no previous profile picture exists
            profilePic = new UserProfile({
                user_id,
                profile_pic,
            });
        } else {
            // Update the existing profile picture entry
            profilePic.profile_pic = profile_pic;
        }

        // Save the profile picture to the database
        await profilePic.save();

        // Optionally, update the User model to store the new profile picture URL
        // const user = await User.findById(userId);
        // user.profilePicture = imageUrl;  // Update user's profile with the new image URL
        // await user.save();

        return res.status(200).json({
            message: "Profile picture updated successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getPicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file uploaded" });
        }

        // User ID from the request (this can be fetched from the JWT token or session)
        const user_id = req.user.user_id; 

        // Get the image URL (path to the uploaded image on the server)
        // console.log(imageUrl);

        // Check if the user already has a profile picture
        let profilePic = await UserProfile.findOne({ user_id });

        if (!profilePic) {
            // Create a new entry if no previous profile picture exists
            return res.status(200).json({
            message: "Profile picture not found"
        });}
        let profile_pic = profilePic.profile_pic

        return res.status(200).json({
            message: "Profile picture updated successfully", profile_pic
        });
        
    }
     catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};
