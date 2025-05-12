import mongoose from "mongoose";
import { Schema } from "mongoose";

const UserProfileSchema = new mongoose.Schema({
    user_id: {
        type: String, // Assuming it's from PostgreSQL
        required: true,
        unique: true
    },
    profile_pic: {
        type: String, // Store the image as a URL or base64
        required: true
    },
    uploaded_at: {
        type: Date,
        default: Date.now
    }
});

// Create the model
const UserProfile = mongoose.model('ProfilePicture', UserProfileSchema);

export default UserProfile;