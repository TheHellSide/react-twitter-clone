import { json } from "express";
import { v2 as cloudinary} from 'cloudinary';

import User from "../models/user.model.js";
import Post from '../models/post.model.js';

export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const UID = req.user._id.toString();

        const user = await User.findById(UID)
        if (!user){
            res.status(404).json(
                {
                    message: "User not found."
                }
            );
        }

        if (!text && !img){
            return res.status(400).json(
                {
                    error: "Post must have text or image."
                }
            );
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            user: UID,
            text,
            img,
        });

        await newPost.save();
        res.status(201).json(
            {newPost}
        )
    } 
    catch (error) {
        console.log(`error-in-createpost-controller: ${error.message}`);
        res.status(500).json(
            {
                error: "Internal server error."
            }
        )
    }
};

// TODO
export const likeUnlikePost = async (req, res) => {
        try {
        
    } 
    catch (error) {
        console.log(`error-in-likeunlikepost-controller: ${error.message}`);
        res.status(500).json(
            {
                error: "Internal server error."
            }
        )
    }
};

// TODO
export const commentPost = async (req, res) => {
        try {
        
    } 
    catch (error) {
        console.log(`error-in-commentpost-controller: ${error.message}`);
        res.status(500).json(
            {
                error: "Internal server error."
            }
        )
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json(
                {
                    message: "Post not found."
                }
            );
        }

        if (post.user.toString() !== req.user._id.toString()) {
            res.status(401).json(
                {
                    message: "Unauthorized: You are not authorized to delete this post."
                }
            );
        }

        if (post.img) {
            const IID = post.img
                .split("/")
                .pop()
                .split(".")[0];
            
            await cloudinary.uploader.destroy(IID);
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json(
            {
                message: "Post deleted successfully."
            }
        )
    } 
    catch (error) {
        console.log(`error-in-deletepost-controller: ${error.message}`);
        res.status(500).json(
            {
                error: "Internal server error."
            }
        )
    }
};