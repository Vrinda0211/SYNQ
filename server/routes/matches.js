const express=require("express");

const router=express.Router();

const Request=require("../models/Request");
const Offer=require("../models/Offer");

router.get("/request/:id",async(req,res)=>
{
    try
    {
        const request=await Request.findById(req.params.id);

        if(!request)
        {
            return res.status(404).json(
                {
                    error:"Request not found"
                }
            );
        }

        if(
            !request.loc||
            !Array.isArray(request.loc.coordinates)||
            request.loc.coordinates.length<2
        )
        {
            return res.status(400).json(
                {
                    error:"Request does not have valid coordinates"
                }
            );
        }

        const [lng,lat]=request.loc.coordinates;

        const matches=await Offer.find(
            {
                category:request.category,
                loc:
                {
                    $near:
                    {
                        $geometry:
                        {
                            type:"Point",
                            coordinates:[lng,lat]
                        },
                        $maxDistance:15000
                    }
                }
            }
        ).limit(20);

        res.json(matches);
    }
    catch(error)
    {
        console.error(
            "Error finding matches:",
            error
        );

        res.status(500).json(
            {
                error:error.message||"Failed to find matches"
            }
        );
    }
});

module.exports=router;