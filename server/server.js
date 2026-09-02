const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
require("dotenv").config();

const authRoutes=require("./routes/auth");
const requestRoutes=require("./routes/requests");
const offerRoutes=require("./routes/offerRoutes");
const matchRoutes=require("./routes/matches");

const app=express();
const PORT=process.env.PORT||3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth",authRoutes);
app.use("/api/requests",requestRoutes);
app.use("/api/offers",offerRoutes);
app.use("/api/matches",matchRoutes);

app.get("/",(req,res)=>
{
    res.json(
        {
            message:"SYNQ server is running"
        }
    );
});

mongoose.connect(process.env.MONGO_URI)
.then(()=>
{
    console.log("MongoDB connected");
    app.listen(PORT,()=>
    {
        console.log(`SYNQ server running on port ${PORT}`);
    });
})
.catch((error)=>
{
    console.error(
        "MongoDB connection failed:",
        error.message
    );
});