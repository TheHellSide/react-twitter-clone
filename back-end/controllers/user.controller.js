import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getUserProfile = async (req, res) => {
    const {username} = req.params;

    try {
        const user =await User.findOne({username}).select("-password");

        if (!user) {
            return res.status(404).json(
                {
                    message: "User not found."
                }
            );
        }

        res.status(200).json(
            {user}
        );
    } 

    catch (error) {
        console.log(`error-in-getuserprofile-controller: ${error.message}`);
        res.status(500).json(
            {
                error: "Internal server error."
            }
        )
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const {id} = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (id === req.user._id.toString()) {
            return res.status(400).json(
                {
                    error: "You can't follow yourself."
                }
            );
        }

        if (!userToModify || !currentUser) {
            return res.status(404).json(
                {
                    error: "User not found."
                }
            );
        }

        const isFollowing = currentUser.following.includes(id);
        if (isFollowing) {
            // unfollow
            await User.findByIdAndUpdate(id, 
                {
                    $pull: { 
                        followers: req.user._id
                    } 
                }
            );

            await User.findByIdAndUpdate(req.user._id, 
                {
                    $pull: { 
                        following: id
                    } 
                }
            );

            res.status(200).json(
                {
                    message: "User unfollowed successfully."
                }
            );
        }

        else {
            // follow
            await User.findByIdAndUpdate(id, 
                {
                    $push: { 
                        followers: req.user._id
                    } 
                }
            );

            await User.findByIdAndUpdate(req.user._id, 
                {
                    $push: { 
                        following: id
                    } 
                }
            );

            const newNotification = new Notification(
                {
                    type: 'follow',
                    from: req.user._id,
                    to: userToModify._id
                }
            );

            await newNotification.save();

            // return `id` for response.
            res.status(200).json(
                {
                    message: "User followed successfully."
                }
            );
        }
    } 
    catch (error) {
        console.log(`error-in-followunfollowuser-controller: ${error.message}`);
        res.status(500).json(
            {
                error: "Internal server error."
            }
        )
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const UID = req.user._id;
        const usersFollowedByMe = await User.findById(UID).select("following");
        const users = await User.aggregate([
            {
                $match: {
                    _id: {$ne:UID}
                }
            },
            {
                $sample:{size:10}
            }
        ]);

        const filteredUsers = users.filter(user => usersFollowedByMe.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach(user => user.password = null);
        res.status(200).json(
            {
                suggestedUsers
            }
        )
    } 
    catch (error) {
        console.log(`error-in-sugestedusers-controller: ${error.message}`);
        res.status(500).json(
            {
                error: "Internal server error."
            }
        )
    }
}

export const updateUser = async (req, res) => {
    const { full_name, email, username, current_password, new_password, bio, link } = req.body;
    let { profile_image, cover_image } = req.body;

    const UID = req.user._id;
    try {
        const user = User.findById(UID);
        if (!user) {
            return res.status(404).json(
                {
                    error: "User not found."
                }
            );
        }

        if ((!new_password && current_password) || (!current_password && new_password)) {
            return res.status(400).json(
                {
                    error: "Please provide both current password and new password."
                }
            );
        }

        if (current_password && new_password) {
            const isMatch = await bcrypt.compare(current_password, user.password);
            if (!isMatch) {
                return res.status(400).json(
                    {
                        error: "Current password is incorrect."
                    }
                );
            }

            if (new_password.length < 6) {
                return res.status(400).json(
                    {
                        error: "Password must be at least 6 characters long"
                    }
                )
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(new_password, salt);
        }

        // cloudinary.com
        if (profile_image) {

        }

        if (cover_image) {
            
        }
    } 

    catch (error) {
        
    }
}