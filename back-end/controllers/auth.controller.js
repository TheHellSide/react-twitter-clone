import { use } from 'react';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

export const signup = async (req, res) => {
    try {
        const { full_name, username, email, password } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json(
                { 
                    error: "Invalid email fromat." 
                }
            );
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json(
                { 
                    error: "Username already taken." 
                }
            );
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json(
                { 
                    error: "Email already taken." 
                }
            );
        }

        // password-hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            full_name: full_name,
            username: username,
            email: email,
            password: hashedPassword
        });

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();

            res.status(201).json(
                {
                    _id: newUser._id,
                    full_name: newUser.full_name,
                    username: newUser.username,
                    email: newUser.email,
                    followers: newUser.followers,
                    following: newUser.following,
                    profile_image: newUser.profile_image,
                    cover_image: newUser.cover_image
                }
            );
        }
        else {
            res.status(400).json(
                {
                    error: "Invalid user data."
                }
            );
        }
    }
    catch (error) {
        console.log(`error-in-signup-controller: ${error.message}`);
        res.status(500).json(
            {
                error: "Internal server error."
            }
        )
    }
};

export const login = async (req, res) => {
    res.json({
        data: "hello"
    })
};

export const logout = async (req, res) => {
    res.json({
        data: "hello"
    })
};