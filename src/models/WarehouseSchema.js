import mongoose from "mongoose";

const warehouseSchema = mongoose.Schema(
    {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        name: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        latitude: { type: Number },
        longitude: { type: Number }
    },
    { timestamps: true }
);

const WarehouseModel = mongoose.model("Warehouse", warehouseSchema);

export default WarehouseModel;