import UserModel from "../models/userSchema.js";

export const getUserProfile = async (req, res) => {
    const user = await UserModel.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            email: user.email,
            role: user.role,
            storeName: user.storeName,
            storeDescription: user.storeDescription,
            passwordLastChangedAt: user.passwordLastChangedAt,
            profileLastUpdatedAt: user.profileLastUpdatedAt,
            notificationPreferences: user.notificationPreferences,
        });
    } else {
        res.status(404).json({ message: "User not found" });
    }
};

export const updateUserProfile = async (req, res) => {
    const user = await UserModel.findById(req.user._id);

    if (user) {
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
            user.passwordLastChangedAt = new Date();
        }
        
        if (req.body.notificationPreferences) {
            user.notificationPreferences = {
                ...user.notificationPreferences,
                ...req.body.notificationPreferences
            };
        }
        if (req.body.storeName) {
            user.storeName = req.body.storeName;
        }
        if (req.body.storeDescription) {
            user.storeDescription = req.body.storeDescription;
        }

        user.profileLastUpdatedAt = new Date();

        const updatedUser = await user.save();
        
        res.json({
            _id: updatedUser._id,
            email: updatedUser.email,
            role: updatedUser.role,
            storeName: updatedUser.storeName,
            storeDescription: updatedUser.storeDescription,
            passwordLastChangedAt: updatedUser.passwordLastChangedAt,
            profileLastUpdatedAt: updatedUser.profileLastUpdatedAt,
            notificationPreferences: updatedUser.notificationPreferences,
        });
    } else {
        res.status(404).json({ message: "User not found" });
    }
};