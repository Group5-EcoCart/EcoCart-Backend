import UserModel from "../models/userSchema.js";

export const getUserProfile = async (req, res) => {
    const user = await UserModel.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            email: user.email,
            role: user.role,
            passwordLastChangedAt: user.passwordLastChangedAt,
            profileLastUpdatedAt: user.profileLastUpdatedAt,
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
        
        user.profileLastUpdatedAt = new Date();

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            email: updatedUser.email,
            role: updatedUser.role,
            passwordLastChangedAt: updatedUser.passwordLastChangedAt,
            profileLastUpdatedAt: updatedUser.profileLastUpdatedAt,
        });
    } else {
        res.status(404).json({ message: "User not found" });
    }
};