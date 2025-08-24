import mongoose from "mongoose";

const AddressSchema = mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"User"
        },
        street:{type:String,required:true},
        city:{type:String,required:true},
        postalCode:{type:String,required:true},
        state:{type:String,required:true},
        country:{type:String,required:true},
        isDefault: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const AddressModel = mongoose.model("Address",AddressSchema);
export default AddressModel;