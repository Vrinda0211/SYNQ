import { useEffect,useRef,useState } from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import { MapContainer,TileLayer,Marker } from "react-leaflet";
import L from "leaflet";
import { io } from "socket.io-client";
import "leaflet/dist/leaflet.css";
import "../styles/Chat.css";

const SOCKET_URL="http://localhost:3001";

const createPinIcon=(color="#632024",size=28)=>
{
    return L.divIcon(
        {
            className:"ChatPin",
            html:`
                <div
                    style="
                        width:${size}px;
                        height:${size}px;
                        border-radius:50%;
                        background:${color};
                        border:4px solid rgba(213,184,147,0.92);
                        box-shadow:0 6px 18px rgba(0,0,0,0.28);
                    "
                ></div>
            `,
            iconSize:[size,size],
            iconAnchor:[size/2,size]
        }
    );
};

export default function Chat()
{
    const navigate=useNavigate();
    const [searchParams]=useSearchParams();

    const requestId=searchParams.get("request");
    const offerId=searchParams.get("offer");

    const chatId=requestId||offerId;
    const chatType=requestId?"request":offerId?"offer":null;

    const [messages,setMessages]=useState([]);
    const [input,setInput]=useState("");
    const [location,setLocation]=useState(
        {
            lat:12.97,
            lng:77.59
        }
    );

    const listRef=useRef(null);
    const socketRef=useRef(null);

    useEffect(()=>
    {
        async function loadDetails()
        {
            if(!chatId||!chatType)
            {
                return;
            }

            try
            {
                const endpoint=
                    chatType==="request"
                        ?`${SOCKET_URL}/api/requests/${chatId}`
                        :`${SOCKET_URL}/api/offers/${chatId}`;

                const response=await fetch(endpoint);

                if(!response.ok)
                {
                    return;
                }

                const item=await response.json();

                if(
                    item.loc&&
                    Array.isArray(item.loc.coordinates)&&
                    item.loc.coordinates.length>=2
                )
                {
                    setLocation(
                        {
                            lat:item.loc.coordinates[1],
                            lng:item.loc.coordinates[0]
                        }
                    );
                }
                else if(
                    item.location&&
                    typeof item.location.lat==="number"&&
                    typeof item.location.lng==="number"
                )
                {
                    setLocation(
                        {
                            lat:item.location.lat,
                            lng:item.location.lng
                        }
                    );
                }
            }
            catch(error)
            {
                console.error(
                    "Error loading chat location:",
                    error
                );
            }
        }

        loadDetails();
    },[chatId,chatType]);

    useEffect(()=>
    {
        async function loadHistory()
        {
            if(!chatId)
            {
                return;
            }

            try
            {
                const response=await fetch(
                    `${SOCKET_URL}/api/messages/${encodeURIComponent(chatId)}`
                );

                if(!response.ok)
                {
                    return;
                }

                const data=await response.json();

                setMessages(
                    Array.isArray(data)
                        ?data
                        :[]
                );
            }
            catch(error)
            {
                console.error(
                    "History load failed:",
                    error
                );
            }
        }

        loadHistory();
    },[chatId]);

    useEffect(()=>
    {
        if(!chatId)
        {
            return;
        }

        const socket=io(
            SOCKET_URL,
            {
                transports:
                [
                    "websocket",
                    "polling"
                ]
            }
        );

        socketRef.current=socket;

        socket.on("connect",()=>
        {
            console.log(
                "Socket connected:",
                socket.id
            );

            socket.emit(
                "joinRoom",
                chatId
            );
        });

        socket.on("newMessage",(message)=>
        {
            setMessages((oldMessages)=>
            {
                const withoutTemporary=oldMessages.filter(
                    messageItem=>!messageItem.temp
                );

                const alreadyExists=withoutTemporary.some(
                    messageItem=>messageItem._id===message._id
                );

                if(alreadyExists)
                {
                    return withoutTemporary;
                }

                return[
                    ...withoutTemporary,
                    message
                ];
            });
        });

        socket.on("disconnect",()=>
        {
            console.log(
                "Socket disconnected"
            );
        });

        return()=>
        {
            socket.disconnect();
            socketRef.current=null;
        };
    },[chatId]);

    useEffect(()=>
    {
        const element=listRef.current;

        if(!element)
        {
            return;
        }

        element.scrollTo(
            {
                top:element.scrollHeight,
                behavior:"smooth"
            }
        );
    },[messages]);

    async function sendMessage()
    {
        const text=input.trim();

        if(!text||!chatId)
        {
            return;
        }

        setInput("");

        const savedUser=localStorage.getItem("synq_user");
        const user=savedUser
            ?JSON.parse(savedUser)
            :null;

        const payload=
        {
            requestId:chatId,
            text,
            fromHelper:true,
            fromUserId:user?.id||"frontend-user",
            fromName:user?.name||"You"
        };

        setMessages(oldMessages=>
        [
            ...oldMessages,
            {
                ...payload,
                ts:new Date().toISOString(),
                temp:true
            }
        ]);

        if(socketRef.current?.connected)
        {
            socketRef.current.emit(
                "sendMessage",
                payload
            );
        }
        else
        {
            try
            {
                const response=await fetch(
                    `${SOCKET_URL}/api/messages/${encodeURIComponent(chatId)}`,
                    {
                        method:"POST",
                        headers:
                        {
                            "Content-Type":"application/json"
                        },
                        body:JSON.stringify(payload)
                    }
                );

                if(!response.ok)
                {
                    throw new Error(
                        "Failed to send message."
                    );
                }

                const savedMessage=await response.json();

                setMessages(oldMessages=>
                    oldMessages.map(
                        message=>
                            message.temp
                                ?savedMessage
                                :message
                    )
                );
            }
            catch(error)
            {
                console.error(
                    "Fallback message failed:",
                    error
                );

                setMessages(oldMessages=>
                    oldMessages.filter(
                        message=>!message.temp
                    )
                );
            }
        }
    }

    function formatTime(timestamp)
    {
        if(!timestamp)
        {
            return "";
        }

        try
        {
            return new Date(timestamp).toLocaleTimeString(
                [],
                {
                    hour:"2-digit",
                    minute:"2-digit"
                }
            );
        }
        catch
        {
            return "";
        }
    }

    if(!chatId)
    {
        return(
            <div className="ChatPage">
                <div className="ChatEmpty">
                    <h2>Chat</h2>
                    <p>
                        No chat selected. Open a request or offer
                        and click Chat.
                    </p>

                    <button
                        onClick={()=>navigate("/map")}
                    >
                        Back to Map
                    </button>
                </div>
            </div>
        );
    }

    return(
        <div className="ChatPage">
            <div className="ChatContainer">
                <div className="ChatHeader">
                    <div>
                        <p className="ChatEyebrow">
                            SYNQ / REAL-TIME COORDINATION
                        </p>

                        <h1>
                            Chat
                            {" — "}
                            {chatType==="offer"
                                ?"Offer"
                                :"Request"}
                        </h1>
                    </div>

                    <button
                        className="ChatExitTop"
                        onClick={()=>navigate("/map")}
                    >
                        Exit Chat
                    </button>
                </div>

                <div className="ChatLayout">
                    <div className="ChatMapCard">
                        <MapContainer
                            center={[
                                location.lat,
                                location.lng
                            ]}
                            zoom={12}
                            scrollWheelZoom={false}
                            className="ChatMap"
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; OpenStreetMap contributors"
                            />

                            <Marker
                                position={[
                                    location.lat,
                                    location.lng
                                ]}
                                icon={createPinIcon(
                                    chatType==="offer"
                                        ?"#2E7D32"
                                        :"#632024"
                                )}
                            />
                        </MapContainer>
                    </div>

                    <div className="ChatBox">
                        <h2>
                            {chatType==="offer"
                                ?"Offer chat"
                                :"Request chat"}
                        </h2>

                        <p className="ChatSubtitle">
                            Coordinate help details with the other person.
                        </p>

                        <div
                            ref={listRef}
                            className="ChatMessages"
                        >
                            {messages.length===0&&(
                                <div className="ChatNoMessages">
                                    No messages yet. Start the conversation.
                                </div>
                            )}

                            {messages.map(
                                (message,index)=>
                                {
                                    const savedUser=
                                        localStorage.getItem(
                                            "synq_user"
                                        );

                                    const user=savedUser
                                        ?JSON.parse(savedUser)
                                        :null;

                                    const mine=
                                        message.temp||
                                        message.fromUserId==="frontend-user"||
                                        (
                                            user?.id&&
                                            message.fromUserId===user.id
                                        )||
                                        message.fromName==="You";

                                    return(
                                        <div
                                            key={
                                                message._id||
                                                `${message.ts}-${index}`
                                            }
                                            className={
                                                `ChatMessageRow ${
                                                    mine
                                                        ?"mine"
                                                        :"other"
                                                }`
                                            }
                                        >
                                            <div
                                                className={
                                                    `ChatBubble ${
                                                        mine
                                                            ?"mine"
                                                            :"other"
                                                    }`
                                                }
                                            >
                                                <div>
                                                    {message.text}
                                                </div>

                                                <div className="ChatTime">
                                                    {formatTime(
                                                        message.ts||
                                                        message.createdAt
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>

                        <div className="ChatInputRow">
                            <input
                                value={input}
                                onChange={
                                    event=>
                                        setInput(
                                            event.target.value
                                        )
                                }
                                onKeyDown={
                                    event=>
                                    {
                                        if(event.key==="Enter")
                                        {
                                            event.preventDefault();
                                            sendMessage();
                                        }
                                    }
                                }
                                placeholder="Enter your message..."
                            />

                            <button
                                onClick={sendMessage}
                            >
                                Send
                            </button>
                        </div>

                        <button
                            className="ChatExitButton"
                            onClick={()=>navigate("/map")}
                        >
                            Exit Chat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}