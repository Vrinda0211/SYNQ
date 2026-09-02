const mongoose=require("mongoose");

const offerSchema=new mongoose.Schema(
    {
        category:
        {
            type:String,
            required:true,
            trim:true
        },

        resources:
        {
            type:String,
            required:true,
            trim:true
        },

        timeFrom:
        {
            type:String,
            default:""
        },

        timeTo:
        {
            type:String,
            default:""
        },

        hasTransport:
        {
            type:Boolean,
            default:false
        },

        locationLabel:
        {
            type:String,
            required:true,
            trim:true
        },

        loc:
        {
            type:
            {
                type:String,
                enum:["Point"],
                default:"Point"
            },

            coordinates:
            {
                type:[Number],
                default:undefined
            }
        },

        createdAt:
        {
            type:Date,
            default:Date.now
        }
    }
);

offerSchema.index({loc:"2dsphere"});

module.exports=mongoose.model("Offer",offerSchema);