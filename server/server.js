const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
const http=require("http");
const { Server }=require("socket.io");
require("dotenv").config();

const authRoutes=require("./routes/auth");
const requestRoutes=require("./routes/requests");
const offerRoutes=require("./routes/offerRoutes");
const messageRoutes=require("./routes/messages");
const Message=require("./models/Message");

const app=express();
const server=http.createServer(app);
const io=new Server(
    server,
    {
        cors:
        {
            origin:"*",
            methods:["GET","POST"]
        }
    }
);

const PORT=process.env.PORT||3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth",authRoutes);
app.use("/api/requests",requestRoutes);
app.use("/api/offers",offerRoutes);
app.use("/api/messages",messageRoutes);

app.get("/",(req,res)=>
{
    res.json(
        {
            message:"SYNQ server is running"
        }
    );
});

io.on("connection",(socket)=>
{
    console.log(
        "Socket connected:",
        socket.id
    );

    socket.on("joinRoom",(requestId)=>
    {
        if(!requestId)
        {
            return;
        }

        socket.join(requestId);

        console.log(
            `Socket ${socket.id} joined room ${requestId}`
        );
    });

    socket.on("sendMessage",async(messageData)=>
    {
        const {
            requestId,
            text,
            fromHelper,
            fromUserId,
            fromName
        }=messageData;

        if(!requestId||!text||!text.trim())
        {
            return;
        }

        try
        {
            const savedMessage=await Message.create(
                {
                    requestId,
                    text:text.trim(),
                    fromHelper:!!fromHelper,
                    fromUserId:fromUserId||null,
                    fromName:fromName||"Unknown",
                    ts:new Date()
                }
            );

            io.to(requestId).emit(
                "newMessage",
                savedMessage
            );
        }
        catch(error)
        {
            console.error(
                "Error saving message:",
                error
            );
        }
    });

    socket.on("disconnect",()=>
    {
        console.log(
            "Socket disconnected:",
            socket.id
        );
    });
});

mongoose.connect(process.env.MONGO_URI)
.then(()=>
{
    console.log("MongoDB connected");

    server.listen(
        PORT,
        ()=>
        {
            console.log(
                `SYNQ server running on port ${PORT}`
            );
        }
    );
})
.catch((error)=>
{
    console.error(
        "MongoDB connection failed:",
        error.message
    );
});