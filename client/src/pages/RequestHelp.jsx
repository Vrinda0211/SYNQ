import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RequestHelp.css";

export default function RequestHelp()
{
    const [category,setCategory]=useState("");
    const [location,setLocation]=useState("");
    const [details,setDetails]=useState("");
    const [urgency,setUrgency]=useState(50);
    const [coords,setCoords]=useState(null);
    const [msg,setMsg]=useState("");
    const navigate=useNavigate();

    function useMyLocation()
    {
        setMsg("");

        if(!navigator.geolocation)
        {
            setMsg("Geolocation is not supported by your browser.");
            return;
        }

        setMsg("Waiting for location permission...");

        navigator.geolocation.getCurrentPosition(
            (position)=>{
                setCoords(
                    {
                        lat:position.coords.latitude,
                        lng:position.coords.longitude
                    }
                );
                setMsg("Location captured.");
            },
            ()=>{
                setMsg("Could not get your location.");
            },
            {
                enableHighAccuracy:true,
                timeout:15000
            }
        );
    }

    function handleSubmit(e)
    {
        e.preventDefault();
        setMsg("");

        if(!category||!location||!details)
        {
            setMsg("Please fill category,location and details.");
            return;
        }

        setMsg("Request details are valid.");
    }

    return(
        <div className="RequestHelp">
            <form className="RequestForm" onSubmit={handleSubmit}>
                <h1 className="RequestTitle">Request Help</h1>

                <div className="FormGroup">
                    <label className="FormLabel">Category</label>

                    <div className="SelectWrapper">
                        <select
                            className="FormSelect"
                            value={category}
                            onChange={(e)=>setCategory(e.target.value)}
                        >
                            <option value="">Select category</option>
                            <option value="Medical Assistance">Medical Assistance</option>
                            <option value="Food & Water">Food & Water</option>
                            <option value="Shelter & Housing">Shelter & Housing</option>
                            <option value="Search & Rescue">Search & Rescue</option>
                            <option value="Supplies & Essentials">Supplies & Essentials</option>
                            <option value="Sanitation & Hygiene">Sanitation & Hygiene</option>
                        </select>
                    </div>
                </div>

                <div className="FormGroup">
                    <label className="FormLabel">Location</label>

                    <input
                        className="FormInput"
                        type="text"
                        value={location}
                        onChange={(e)=>setLocation(e.target.value)}
                        placeholder="Enter location (city,landmark,address...)"
                    />
                </div>

                <div className="LocationActions">
                    <button
                        type="button"
                        className="LocationButton"
                        onClick={useMyLocation}
                    >
                        Use my location
                    </button>

                    <div className="Coordinates">
                        {coords?`${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}`:"No coords"}
                    </div>
                </div>

                <div className="FormGroup">
                    <label className="FormLabel">Details</label>

                    <textarea
                        className="DetailsInput"
                        value={details}
                        onChange={(e)=>setDetails(e.target.value)}
                        placeholder="Describe the assistance needed"
                    />
                </div>

                <div className="FormGroup">
                    <div className="UrgencyHeader">
                        <span>Urgency</span>
                        <span>
                            {urgency>=75?"High":urgency>=40?"Moderate":"Low"}
                        </span>
                    </div>

                    <input
                        className="UrgencySlider"
                        type="range"
                        min="0"
                        max="100"
                        value={urgency}
                        onChange={(e)=>setUrgency(Number(e.target.value))}
                    />
                </div>

                {msg&&
                    <div className="RequestMessage">
                        {msg}
                    </div>
                }

                <div className="RequestActions">
                    <button
                        type="button"
                        className="CancelButton"
                        onClick={()=>navigate("/")}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="SubmitButton"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
}