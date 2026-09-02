const express=require("express");
const router=express.Router();
const Request=require("../models/Request");

router.post("/",async(req,res)=>
{
    try
    {
        const payload=
        {
            category:req.body.category,
            details:req.body.details,
            urgency:req.body.urgency||50,
            locationLabel:req.body.locationLabel||req.body.location||undefined
        };

        if(
            req.body.loc&&
            Array.isArray(req.body.loc.coordinates)
        )
        {
            payload.loc=req.body.loc;
        }
        else if(
            req.body.location&&
            typeof req.body.location.lat==="number"&&
            typeof req.body.location.lng==="number"
        )
        {
            payload.loc=
            {
                type:"Point",
                coordinates:
                [
                    req.body.location.lng,
                    req.body.location.lat
                ]
            };
        }

        if(!payload.category||!payload.details||!payload.locationLabel)
        {
            return res.status(400).json(
                {
                    error:"Category, details and location are required."
                }
            );
        }

        const request=await Request.create(payload);

        res.status(201).json(request);
    }
    catch(error)
    {
        console.error("Error creating request:",error);

        res.status(500).json(
            {
                error:error.message||"Failed to create request"
            }
        );
    }
});

router.get("/",async(req,res)=>
{
    try
    {
        const {
            near,
            radius=15000,
            category
        }=req.query;

        const filter={};

        if(category)
        {
            filter.category=category;
        }

        if(near)
        {
            const parts=String(near).split(",").map(Number);

            if(
                parts.length===2&&
                !Number.isNaN(parts[0])&&
                !Number.isNaN(parts[1])
            )
            {
                const [lat,lng]=parts;

                filter.loc=
                {
                    $near:
                    {
                        $geometry:
                        {
                            type:"Point",
                            coordinates:[lng,lat]
                        },
                        $maxDistance:Number(radius)
                    }
                };
            }
        }

        const requests=await Request.find(filter).limit(500);

        res.json(requests);
    }
    catch(error)
    {
        console.error("Error fetching requests:",error);

        res.status(500).json(
            {
                error:error.message||"Failed to fetch requests"
            }
        );
    }
});

router.get("/:id",async(req,res)=>
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

        res.json(request);
    }
    catch(error)
    {
        console.error("Error fetching request:",error);

        res.status(500).json(
            {
                error:error.message||"Failed to fetch request"
            }
        );
    }
});

module.exports=router;