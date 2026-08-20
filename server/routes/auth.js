const express=require("express");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const User=require("../models/User");

const router=express.Router();

router.post("/signup",async(req,res)=>
{
    try
    {
        const {name,email,password}=req.body;

        if(!name||!email||!password)
        {
            return res.status(400).json(
                {
                    error:"Please fill all fields."
                }
            );
        }

        const existingUser=await User.findOne({email});

        if(existingUser)
        {
            return res.status(409).json(
                {
                    error:"An account with this email already exists."
                }
            );
        }

        const hashedPassword=await bcrypt.hash(password,10);

        const user=await User.create(
            {
                name,
                email,
                password:hashedPassword
            }
        );

        const token=jwt.sign(
            {
                id:user._id,
                email:user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"7d"
            }
        );

        res.status(201).json(
            {
                message:"Account created successfully.",
                token,
                user:
                {
                    id:user._id,
                    name:user.name,
                    email:user.email
                }
            }
        );
    }
    catch(error)
    {
        console.error(error);
        res.status(500).json(
            {
                error:"Server error."
            }
        );
    }
});

router.post("/login",async(req,res)=>
{
    try
    {
        const {email,password}=req.body;

        if(!email||!password)
        {
            return res.status(400).json(
                {
                    error:"Please enter your email and password."
                }
            );
        }

        const user=await User.findOne({email});

        if(!user)
        {
            return res.status(401).json(
                {
                    error:"Invalid email or password."
                }
            );
        }

        const passwordMatch=await bcrypt.compare(password,user.password);

        if(!passwordMatch)
        {
            return res.status(401).json(
                {
                    error:"Invalid email or password."
                }
            );
        }

        const token=jwt.sign(
            {
                id:user._id,
                email:user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"7d"
            }
        );

        res.json(
            {
                message:"Login successful.",
                token,
                user:
                {
                    id:user._id,
                    name:user.name,
                    email:user.email
                }
            }
        );
    }
    catch(error)
    {
        console.error(error);
        res.status(500).json(
            {
                error:"Server error."
            }
        );
    }
});

module.exports=router;