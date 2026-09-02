const express=require("express");
const router=express.Router();
const Offer=require("../models/Offer");

router.post("/",async(req,res)=>
{
    try
    {
        const payload=
        {
            category:req.body.category,
            resources:req.body.resources,
            timeFrom:req.body.timeFrom||"",
            timeTo:req.body.timeTo||"",
            hasTransport:!!req.body.hasTransport,
            locationLabel:req.body.locationLabel||req.body.location||undefined
        };

        if(req.body.loc&&Array.isArray(req.body.loc.coordinates))
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

        const offer=await Offer.create(payload);

        res.status(201).json(offer);
    }
    catch(err)
    {
        console.error("Error creating offer:",err);

        res.status(500).json(
            {
                error:err.message||"Failed to create offer"
            }
        );
    }
});

router.get("/",async(req,res)=>
{
    try
    {
        const {near,radius=15000,category}=req.query;

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
                        $maxDistance:Number(radius||15000)
                    }
                };
            }
        }

        const offers=await Offer.find(filter).limit(500);

        res.json(offers);
    }
    catch(err)
    {
        console.error("Error fetching offers:",err);

        res.status(500).json(
            {
                error:err.message||"Failed to fetch offers"
            }
        );
    }
});

module.exports=router;