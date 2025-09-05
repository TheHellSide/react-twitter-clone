import Notification from '../models/notification.model.js';

export const getNotifications = async (req, res) => {
    try {
        const UID = req.user._id;
        const notifications = await Notification.find({ to: UID })
            .populate(
                {
                    path: "from",
                    select: "username profileImg"
                }
            );
        
        await Notification.updateMany({ to: UID }, { read: true });
        res.status(200).json(
            notifications
        );
    } 
    catch (error) {
        console.log(`error-in-getnotifications-controller: ${error.message}`);
        res.status(500).json(
            {
                error: "Internal server error."
            }
        );
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const UID = req.user._id;

        await Notification.deleteMany({ to: UID });
        res.status(200).json(
            {
                message: "Notifications deleted successfully."
            }
        );
    } 
    catch (error) {
        console.log(`error-in-deletenotifications-controller: ${error.message}`);
        res.status(500).json(
            {
                error: "Internal server error."
            }
        );
    }
}

export const deleteNotification = async (req, res) => {
    try {
        const UID = req.user._id;
        const NID = req.params.id;

        const notification = Notification.findById(NID);
        if (!notification) {
            return res.status(404).json(
                {
                    message: "Notification not found."
                }
            );
        }

        if (notification.to.toString() !== UID.toString()) {
            return res.status(403).json(
                {
                    error: "Unauthorized: you are not allowed to delete this notification."
                }
            );
        }

        await Notification.findByIdAndDelete(NID);
        res.status(200).json(
            {
                message: "Notification deleted successfully."
            }
        );
    } 
    catch (error) {
        console.log(`error-in-deletenotification-controller: ${error.message}`);
        res.status(500).json(
            {
                error: "Internal server error."
            }
        );
    }
}