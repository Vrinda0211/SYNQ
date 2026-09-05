const express=require("express");
const router=express.Router();
const Message=require("../models/Message");

router.get("/:requestId",async(req,res)=>
{
    const {requestId}=req.params;

    try
    {
        const messages=await Message.find(
            {
                requestId
            }
        )
        .sort(
            {
                ts:1
            }
        )
        .lean();

        res.json(messages);
    }
    catch(error)
    {
        console.error(
            "Error loading messages:",
            error
        );

        res.status(500).json(
            {
                error:"Failed to load messages"
            }
        );
    }
});

router.post("/:requestId",async(req,res)=>
{
    const {requestId}=req.params;

    const {
        fromUserId,
        fromName,
        text,
        fromHelper
    }=req.body;

    if(!text||!text.trim())
    {
        return res.status(400).json(
            {
                error:"Message text is required"
            }
        );
    }

    try
    {
        const message=await Message.create(
            {
                requestId,
                fromUserId:fromUserId||null,
                fromName:fromName||"Unknown",
                text:text.trim(),
                fromHelper:!!fromHelper,
                ts:new Date()
            }
        );

        res.status(201).json(message);
    }
    catch(error)
    {
        console.error(
            "Error saving message:",
            error
        );

        res.status(500).json(
            {
                error:"Failed to save message"
            }
        );
    }
});

module.exports=router;