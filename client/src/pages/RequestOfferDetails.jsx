import { useEffect,useState } from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import { MapContainer,TileLayer,Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/RequestOfferDetails.css";

const BACKEND="http://localhost:3001";

const createPinIcon=(color="#632024")=>
{
    return L.divIcon(
        {
            className:"DetailsPin",
            html:`
                <div class="DetailsPinInner" style="background:${color};"></div>
            `,
            iconSize:[36,36],
            iconAnchor:[18,36]
        }
    );
};

function getCoordinates(item)
{
    if(
        item?.loc&&
        Array.isArray(item.loc.coordinates)&&
        item.loc.coordinates.length>=2
    )
    {
        const [lng,lat]=item.loc.coordinates;

        return {lat,lng};
    }

    if(
        item?.location&&
        typeof item.location.lat==="number"&&
        typeof item.location.lng==="number"
    )
    {
        return {
            lat:item.location.lat,
            lng:item.location.lng
        };
    }

    if(
        typeof item?.lat==="number"&&
        typeof item?.lng==="number"
    )
    {
        return {
            lat:item.lat,
            lng:item.lng
        };
    }

    return null;
}

export default function RequestOfferDetails()
{
    const navigate=useNavigate();
    const [searchParams]=useSearchParams();

    const requestId=searchParams.get("request");
    const offerId=searchParams.get("offer");

    const type=requestId?"request":offerId?"offer":null;
    const id=requestId||offerId;

    const [data,setData]=useState(null);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");

    useEffect(()=>
    {
        async function loadDetails()
        {
            if(!type||!id)
            {
                setError("No request or offer was selected.");
                setLoading(false);
                return;
            }

            try
            {
                const endpoint=
                    type==="request"
                        ?`${BACKEND}/api/requests/${id}`
                        :`${BACKEND}/api/offers/${id}`;

                const response=await fetch(endpoint);

                if(!response.ok)
                {
                    throw new Error("Failed to load details.");
                }

                const item=await response.json();

                setData(item);
            }
            catch(loadError)
            {
                console.error("Details loading error:",loadError);
                setError("Unable to load the selected details.");
            }
            finally
            {
                setLoading(false);
            }
        }

        loadDetails();
    },[type,id]);

    if(loading)
    {
        return(
            <div className="DetailsPage">
                <div className="DetailsLoading">
                    Loading details...
                </div>
            </div>
        );
    }

    if(error||!data)
    {
        return(
            <div className="DetailsPage">
                <div className="DetailsError">
                    <h1>Details unavailable</h1>
                    <p>{error||"The selected item could not be found."}</p>
                    <button
                        className="DetailsPrimaryButton"
                        onClick={()=>navigate("/map")}
                    >
                        Back to Map
                    </button>
                </div>
            </div>
        );
    }

    const coordinates=getCoordinates(data);

    const lat=coordinates?.lat??12.9279;
    const lng=coordinates?.lng??77.6271;

    const locationLabel=
        data.locationLabel||
        "Location not specified";

    const category=
        data.category||
        (type==="request"?"Request":"Offer");

    const isRequest=type==="request";

    return(
        <div className="DetailsPage">
            <div className="DetailsContainer">
                <div className="DetailsHeader">
                    <div>
                        <p className="DetailsEyebrow">
                            SYNQ / COMMUNITY RESOURCE
                        </p>

                        <h1>
                            {isRequest
                                ?"Request details"
                                :"Offer details"}
                        </h1>
                    </div>

                    <div className="DetailsHeaderActions">
                        <button
                            className="DetailsSecondaryButton"
                            onClick={()=>navigate("/map")}
                        >
                            Close
                        </button>

                        <button
                            className="DetailsPrimaryButton"
                            onClick={()=>navigate("/offer")}
                        >
                            Offer Help
                        </button>
                    </div>
                </div>

                <div className="DetailsContent">
                    <div className="DetailsMapCard">
                        <MapContainer
                            center={[lat,lng]}
                            zoom={14}
                            scrollWheelZoom={false}
                            className="DetailsMap"
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; OpenStreetMap contributors"
                            />

                            <Marker
                                position={[lat,lng]}
                                icon={createPinIcon(
                                    isRequest
                                        ?"#632024"
                                        :"#2E7D32"
                                )}
                            />
                        </MapContainer>
                    </div>

                    <div className="DetailsCard">
                        <p className="DetailsCategory">
                            {String(category).toUpperCase()}
                        </p>

                        <h2>{category}</h2>

                        {isRequest&&(
                            <div className="UrgencyBadge">
                                Urgency:{" "}
                                {typeof data.urgency!=="undefined"
                                    ?data.urgency
                                    :"Not specified"}
                            </div>
                        )}

                        <div className="DetailsMeta">
                            <div className="DetailsMetaItem">
                                <span className="DetailsMetaIcon">
                                    ◉
                                </span>

                                <span>
                                    {locationLabel}
                                </span>
                            </div>
                        </div>

                        {isRequest?(
                            <div className="DetailsSection">
                                <h3>What is needed</h3>

                                <p>
                                    {data.details||
                                        "No details provided."}
                                </p>
                            </div>
                        ):(
                            <>
                                <div className="DetailsSection">
                                    <h3>Resources</h3>

                                    <p>
                                        {data.resources||
                                            "No resources information provided."}
                                    </p>
                                </div>

                                <div className="DetailsSection">
                                    <h3>Time window</h3>

                                    <p>
                                        {data.timeFrom||data.timeTo
                                            ?`${data.timeFrom||"—"} — ${data.timeTo||"—"}`
                                            :"No time window provided."}
                                    </p>
                                </div>

                                <div className="DetailsSection">
                                    <h3>Transport available</h3>

                                    <p>
                                        {typeof data.hasTransport==="boolean"
                                            ?data.hasTransport
                                                ?"Has transport"
                                                :"Doesn't have transport"
                                            :"Not specified"}
                                    </p>
                                </div>
                            </>
                        )}

                        <div className="VerifiedRow">
                            <div className="VerifiedIcon">
                                ✓
                            </div>

                            <span>Verified</span>
                        </div>

                        <div className="DetailsActions">
                            <button
                                className="DetailsChatButton"
                                onClick={()=>
                                    navigate(
                                        isRequest
                                            ?`/chat?request=${data._id}`
                                            :`/chat?offer=${data._id}`
                                    )
                                }
                            >
                                Chat
                            </button>

                            <button
                                className="DetailsReportButton"
                                onClick={()=>
                                    window.alert(
                                        "Report submitted."
                                    )
                                }
                            >
                                REPORT
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}