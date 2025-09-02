import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    full_name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId, // refers to 'user model'.
            ref: "User",
            default: []
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: []
        }
    ],
    profile_image: {
        type: String,
        default: ""
    },
    cover_image: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    link: {
        type: String,
        default: ""
    },
},
    {
        timestamps: true // created_at
    }
);

// 'users'
const User = mongoose.model("User", userSchema);
export default User;