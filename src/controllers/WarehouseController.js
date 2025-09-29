import WarehouseModel from "../models/WarehouseSchema.js";

export const getWarehouses = async (req, res) => {
    try {
        const warehouses = await WarehouseModel.find({ seller: req.user._id });
        res.status(200).json(warehouses);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching warehouses." });
    }
};

export const addWarehouse = async (req, res) => {
    const { name, street, city, state, postalCode, country, latitude, longitude } = req.body;
    try {
        const warehouse = new WarehouseModel({
            seller: req.user._id,
            name, street, city, state, postalCode, country, latitude, longitude
        });
        const newWarehouse = await warehouse.save();
        res.status(201).json(newWarehouse);
    } catch (error) {
        res.status(400).json({ message: "Error creating warehouse", error: error.message });
    }
};

export const updateWarehouse = async (req, res) => {
    const { id } = req.params;
    try {
        const warehouse = await WarehouseModel.findById(id);
        if (!warehouse) {
            return res.status(404).json({ message: "Warehouse not found" });
        }
        if (warehouse.seller.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }
        const updatedWarehouse = await WarehouseModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );
        res.status(200).json(updatedWarehouse);
    } catch (error) {
        res.status(400).json({ message: "Error updating warehouse", error: error.message });
    }
};

export const deleteWarehouse = async (req, res) => {
    const { id } = req.params;
    try {
        const warehouse = await WarehouseModel.findById(id);
        if (!warehouse) {
            return res.status(404).json({ message: "Warehouse not found" });
        }
        if (warehouse.seller.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }
        await WarehouseModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Warehouse deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting warehouse", error: error.message });
    }
};