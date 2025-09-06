import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
    {
        email:{type:String,required:true},
        role:{type:String,required:true},
        password:{type:String,required:true},
        addresses: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Address'
        }]
    },
    {timestamps:true}
);
userSchema.pre("save",async function(next){
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
});

const UserModel = mongoose.model("User",userSchema);

export default UserModel;