import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/OfferHelp.css";

export default function OfferHelp()
{
    const [category,setCategory]=useState("");
    const [resources,setResources]=useState("");
    const [timeFrom,setTimeFrom]=useState("");
    const [timeTo,setTimeTo]=useState("");
    const [hasTransport,setHasTransport]=useState(false);
    const [location,setLocation]=useState("");
    const [coords,setCoords]=useState(null);
    const [msg,setMsg]=useState("");
    const [submitting,setSubmitting]=useState(false);

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

    async function handleSubmit(e)
    {
        e.preventDefault();
        setMsg("");

        if(!category||!resources||!location)
        {
            setMsg(
                "Please fill category, resources and location."
            );

            return;
        }

        setSubmitting(true);

        try
        {
            const response=await fetch(
                "http://localhost:3001/api/offers",
                {
                    method:"POST",
                    headers:
                    {
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify(
                        {
                            category,
                            resources,
                            timeFrom,
                            timeTo,
                            hasTransport,
                            locationLabel:location,
                            location:coords
                        }
                    )
                }
            );

            const data=await response.json();

            if(!response.ok)
            {
                throw new Error(
                    data.error||"Failed to submit offer."
                );
            }

            setMsg("Offer submitted successfully.");

            setCategory("");
            setResources("");
            setTimeFrom("");
            setTimeTo("");
            setHasTransport(false);
            setLocation("");
            setCoords(null);

            setTimeout(()=>
            {
                navigate("/map");
            },1000);
        }
        catch(error)
        {
            setMsg(
                error.message||"Could not submit offer."
            );
        }
        finally
        {
            setSubmitting(false);
        }
    }

    return(
        <div className="OfferHelp">

            <form
                className="OfferForm"
                onSubmit={handleSubmit}
            >

                <h1 className="OfferTitle">
                    Offer Help
                </h1>

                <div className="FormGroup">
                    <label className="FormLabel">
                        Category
                    </label>

                    <select
                        className="FormSelect"
                        value={category}
                        onChange={(e)=>
                            setCategory(e.target.value)
                        }
                    >
                        <option value="">
                            Select category
                        </option>

                        <option value="Medical Assistance">
                            Medical Assistance
                        </option>

                        <option value="Food & Water">
                            Food & Water
                        </option>

                        <option value="Shelter & Housing">
                            Shelter & Housing
                        </option>

                        <option value="Search & Rescue">
                            Search & Rescue
                        </option>

                        <option value="Supplies & Essentials">
                            Supplies & Essentials
                        </option>

                        <option value="Sanitation & Hygiene">
                            Sanitation & Hygiene
                        </option>
                    </select>
                </div>

                <div className="FormGroup">
                    <label className="FormLabel">
                        Resources
                    </label>

                    <textarea
                        className="DetailsInput"
                        value={resources}
                        onChange={(e)=>
                            setResources(e.target.value)
                        }
                        placeholder="Describe the resources or assistance you can provide"
                    />
                </div>

                <div className="FormGroup">

                    <label className="FormLabel">
                        Availability
                    </label>

                    <div className="TimeInputs">

                        <input
                            className="FormInput"
                            type="time"
                            value={timeFrom}
                            onChange={(e)=>
                                setTimeFrom(e.target.value)
                            }
                        />

                        <span className="TimeSeparator">
                            to
                        </span>

                        <input
                            className="FormInput"
                            type="time"
                            value={timeTo}
                            onChange={(e)=>
                                setTimeTo(e.target.value)
                            }
                        />

                    </div>

                </div>

                <div className="FormGroup">

                    <label className="CheckboxLabel">

                        <input
                            type="checkbox"
                            checked={hasTransport}
                            onChange={(e)=>
                                setHasTransport(
                                    e.target.checked
                                )
                            }
                        />

                        <span>
                            I can provide transportation
                        </span>

                    </label>

                </div>

                <div className="FormGroup">

                    <label className="FormLabel">
                        Location
                    </label>

                    <input
                        className="FormInput"
                        type="text"
                        value={location}
                        onChange={(e)=>
                            setLocation(e.target.value)
                        }
                        placeholder="Enter location (city, landmark, address...)"
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
                        {
                            coords
                            ?
                            `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}`
                            :
                            "No coords"
                        }
                    </div>

                </div>

                {msg&&
                    <div className="OfferMessage">
                        {msg}
                    </div>
                }

                <div className="OfferActions">

                    <button
                        type="button"
                        className="CancelButton"
                        onClick={()=>
                            navigate("/")
                        }
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="SubmitButton"
                        disabled={submitting}
                    >
                        {
                            submitting
                            ?
                            "Submitting..."
                            :
                            "Submit"
                        }
                    </button>

                </div>

            </form>

        </div>
    );
}