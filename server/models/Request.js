const mongoose=require("mongoose");

const RequestSchema=new mongoose.Schema(
    {
        category:
        {
            type:String,
            required:true
        },

        details:
        {
            type:String,
            required:true
        },

        urgency:
        {
            type:Number,
            required:true,
            min:0,
            max:100
        },

        locationLabel:
        {
            type:String,
            required:true
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
                required:true
            }
        }
    },
    {
        timestamps:true
    }
);

RequestSchema.index(
    {
        loc:"2dsphere"
    }
);

module.exports=mongoose.model("Request",RequestSchema);