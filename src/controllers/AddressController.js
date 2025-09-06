import AddressModel from "../models/AddressSchema.js";
import UserModel from "../models/userSchema.js";
export const addAddress = async (req, res) => {
    const { street, city, state, postalCode, country, isDefault } = req.body;
    try {
        const address = new AddressModel({
            user: req.user._id,
            street,
            city,
            postalCode,
            state,
            country,
            isDefault
        })

        const newAddress = await address.save();

        await UserModel.findByIdAndUpdate(
            req.user._id,
            { $push: { addresses: newAddress._id } }
        );

        return res.status(201).json(newAddress);
    } catch (err) {
        console.log("Error creating Address", err);
        return res.status(400).json({ message: "Error Creating Address", error: err.message });
    }
}

export const editAddress = async (req, res) => {
    const { id } = req.params;
    try {
        const address = await AddressModel.findById(id);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }
        if (address.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }
        const updatedAddress = await AddressModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );
        return res.status(200).json(updatedAddress);
    } catch (err) {
        console.log("Error editing Address", err);
        return res.status(400).json({ message: "Error editing Address", error: err.message });
    }
};

export const getAddress = async (req, res) => {
    try {
        const addresses = await AddressModel.find({ user: req.user._id });
        return res.status(200).json(addresses);
    } catch (err) {
        console.log("Error fetching Address", err);
        return res.status(400).json({ message: "error fetching Address", error: err.message });
    }
}

export const deleteAddress = async (req, res) => {
    const { id } = req.params;

    try {
        const deleteAddress = await AddressModel.findByIdAndDelete(id);

        await UserModel.findByIdAndUpdate(
            req.user._id,
            { $pull: { addresses: id } }
        );
        return res.status(200).json(deleteAddress);
    } catch (err) {
        console.log("Error deleting Address", err);
        return res.status(400).json({ message: "error deleting Address", error: err.message });
    }
} 