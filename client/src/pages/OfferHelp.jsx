import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/OfferHelp.css";

export default function OfferHelp()
{
    const [category,setCategory]=useState("");
    const [location,setLocation]=useState("");
    const [coords,setCoords]=useState(null);
    const [resources,setResources]=useState("");
    const [timeFrom,setTimeFrom]=useState("");
    const [timeTo,setTimeTo]=useState("");
    const [hasTransport,setHasTransport]=useState(false);
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
            (position)=>
            {
                setCoords(
                    {
                        lat:position.coords.latitude,
                        lng:position.coords.longitude
                    }
                );
                setMsg("Location captured.");
            },
            ()=>
            {
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

        if(!category||!location||!resources)
        {
            setMsg("Please fill all required fields.");
            return;
        }

        setMsg("Offer details are valid.");
    }

    return(
        <div className="OfferHelp">
            <form className="OfferForm" onSubmit={handleSubmit}>
                <h1 className="OfferTitle">Offer Help</h1>

                <div className="OfferGroup">
                    <label className="OfferLabel">Category</label>

                    <select
                        className="OfferInput"
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

                <div className="OfferGroup">
                    <label className="OfferLabel">Location</label>

                    <input
                        className="OfferInput"
                        type="text"
                        value={location}
                        onChange={(e)=>setLocation(e.target.value)}
                        placeholder="Enter a place / landmark / address"
                    />
                </div>

                <div className="OfferLocationActions">
                    <button
                        type="button"
                        className="OfferLocationButton"
                        onClick={useMyLocation}
                    >
                        Use my location
                    </button>

                    <div className="OfferCoordinates">
                        {coords?`${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}`:"No coords"}
                    </div>
                </div>

                <div className="OfferGroup">
                    <label className="OfferLabel">Resources</label>

                    <input
                        className="OfferInput"
                        type="text"
                        value={resources}
                        onChange={(e)=>setResources(e.target.value)}
                        placeholder="Items,skills,services..."
                    />
                </div>

                <div className="OfferGroup">
                    <label className="OfferLabel">Time window</label>

                    <div className="TimeWindow">
                        <input
                            className="OfferInput"
                            type="text"
                            value={timeFrom}
                            onChange={(e)=>setTimeFrom(e.target.value)}
                            placeholder="From"
                        />

                        <input
                            className="OfferInput"
                            type="text"
                            value={timeTo}
                            onChange={(e)=>setTimeTo(e.target.value)}
                            placeholder="To"
                        />
                    </div>
                </div>

                <div className="TransportGroup">
                    <span className="OfferLabel">Has transport</span>

                    <label className="TransportSwitch">
                        <input
                            type="checkbox"
                            checked={hasTransport}
                            onChange={()=>setHasTransport((value)=>!value)}
                        />
                        <span className="SwitchTrack"></span>
                        <span className="SwitchThumb"></span>
                    </label>
                </div>

                {msg&&
                    <div className="OfferMessage">
                        {msg}
                    </div>
                }

                <div className="OfferActions">
                    <button
                        type="button"
                        className="OfferCancelButton"
                        onClick={()=>navigate("/")}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="OfferSubmitButton"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
}