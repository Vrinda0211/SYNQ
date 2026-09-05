const mongoose=require("mongoose");

const messageSchema=new mongoose.Schema(
    {
        requestId:
        {
            type:String,
            required:true,
            index:true
        },
        fromUserId:
        {
            type:String,
            default:null
        },
        fromName:
        {
            type:String,
            default:"Unknown"
        },
        text:
        {
            type:String,
            required:true,
            trim:true
        },
        fromHelper:
        {
            type:Boolean,
            default:false
        },
        ts:
        {
            type:Date,
            default:Date.now
        }
    },
    {
        timestamps:true
    }
);

module.exports=mongoose.model("Message",messageSchema);