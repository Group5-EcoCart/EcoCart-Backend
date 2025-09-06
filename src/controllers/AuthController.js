import UserModel from "../models/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateJWTToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:"2d",
    });
};

export const registerUser = async (req,res)=>{
    const {email,role,password,confirmpassword} = req.body;

    const userExist = await UserModel.findOne({email});

    if(userExist){
        return res.status(400).json({ message: "User already exists" });
    }

    if(password!=confirmpassword){
        return res.status(400).json({ message: "Password did not matched" });
    }

    const user = await UserModel.create({
        email,
        role,
        password
    });

    if(user){
        res.status(201).json({
            _id:user._id,
            email:user.email,
            role:user.role,
            token:generateJWTToken(user._id)
        });
    }else{
       return res.status(400).json({message:"Invalid user data"});
    }
};

export const loginUser = async(req,res)=>{
    const {email,password} = req.body;

    const user  =await UserModel.findOne({email});
    const isMatch = user && user.password ? await bcrypt.compare(password, user.password) : false;
    if(user && isMatch){
        res.status(200).json({
            _id:user._id,
            email:user.email,
            role:user.role,
            token:generateJWTToken(user._id)
        });
    }else{
       return res.status(401).json({ message: "Invalid email or password" });
    }
}