import { v2 as cloudinary } from "cloudinary";

import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        if (posts.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(posts);
    } catch (error) {
        console.log(`error-in-getallposts-controller: ${error.message}`);
        res.status(500).json({
            error: "Internal server error.",
        });
    }
};

export const getFollowingPosts = async (req, res) => {
    try {
        const UID = req.user._id;
        const user = await User.findById(UID);
        if (!user) {
            res.status(404).json({
                message: "User not found.",
            });
        }

        const following = user.following;
        const feedPosts = await Post.find({ user: { $in: following } })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        res.status(200).json(feedPosts);
    } catch (error) {
        console.log(`error-in-getfollowingposts-controller: ${error.message}`);
        res.status(500).json({
            error: "Internal server error.",
        });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        res.status(200).json(posts);
    } catch (error) {
        console.log(`error-in-getuserposts-controller: ${error.message}`);
        res.status(500).json({
            error: "Internal server error.",
        });
    }
};

export const getLikedPosts = async (req, res) => {
    const UID = req.params.id;

    try {
        const user = await User.findById(UID);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        res.status(200).json(likedPosts);
    } catch (error) {
        console.log(`error-in-getlikedposts-controller: ${error.message}`);
        res.status(500).json({
            error: "Internal server error.",
        });
    }
};

export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const UID = req.user._id.toString();

        const user = await User.findById(UID);
        if (!user) {
            res.status(404).json({
                message: "User not found.",
            });
        }

        if (!text && !img) {
            return res.status(400).json({
                error: "Post must have text or image.",
            });
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
        res.status(201).json(newPost);
    } catch (error) {
        console.log(`error-in-createpost-controller: ${error.message}`);
        res.status(500).json({
            error: "Internal server error.",
        });
    }
};

export const likeUnlikePost = async (req, res) => {
    try {
        const UID = req.user._id;
        const { id: PID } = req.params;

        const post = await Post.findById(PID);
        if (!post) {
            res.status(404).json({
                message: "Post not found.",
            });
        }

        const userLikedPost = post.likes.includes(UID);
        if (userLikedPost) {
            // unlike
            await Post.updateOne({ _id: PID }, { $pull: { likes: UID } });
            await User.updateOne({ _id: UID }, { $pull: { likedPosts: PID } });
            res.status(200).json({
                message: "Post unliked successfully.",
            });
        } else {
            // like
            post.likes.push(UID);
            await User.updateOne({ _id: UID }, { $push: { likedPosts: PID } });
            await post.save();

            const notification = new Notification({
                from: UID,
                to: post.user,
                type: "like",
            });
            await notification.save();

            res.status(200).json({
                message: "Post liked successfully.",
            });
        }
    } catch (error) {
        console.log(`error-in-likeunlikepost-controller: ${error.message}`);
        res.status(500).json({
            error: "Internal server error.",
        });
    }
};

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        const PID = req.params.id;
        const UID = req.user._id;

        if (!text) {
            return res.status(400).json({
                error: "Text field is reqired.",
            });
        }

        const post = await Post.findById(PID);
        if (!post) {
            res.status(404).json({
                message: "Post not found.",
            });
        }

        const comment = {
            user: UID,
            text,
        };

        post.comments.push(comment);
        await post.save();

        return res.status(200).json(post);
    } catch (error) {
        console.log(`error-in-commentonpost-controller: ${error.message}`);
        res.status(500).json({
            error: "Internal server error.",
        });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({
                message: "Post not found.",
            });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            res.status(401).json({
                message: "Unauthorized: You are not authorized to delete this post.",
            });
        }

        if (post.img) {
            const IID = post.img.split("/").pop().split(".")[0];

            await cloudinary.uploader.destroy(IID);
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({
            message: "Post deleted successfully.",
        });
    } catch (error) {
        console.log(`error-in-deletepost-controller: ${error.message}`);
        res.status(500).json({
            error: "Internal server error.",
        });
    }
};
