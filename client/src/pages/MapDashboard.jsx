import { useEffect,useRef,useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/MapDashboard.css";

const BACKEND="http://localhost:3001";

const requestPin=L.divIcon(
{
    className:"RequestPin",
    html:
        `<div style="
            width:18px;
            height:18px;
            border-radius:50%;
            background:#632024;
            border:3px solid #F4E8D7;
            box-shadow:0 3px 8px rgba(0,0,0,0.35);
        "></div>`,
    iconSize:[24,24],
    iconAnchor:[12,12]
});

const offerPin=L.divIcon(
{
    className:"OfferPin",
    html:
        `<div style="
            width:18px;
            height:18px;
            border-radius:50%;
            background:#557A5A;
            border:3px solid #F4E8D7;
            box-shadow:0 3px 8px rgba(0,0,0,0.35);
        "></div>`,
    iconSize:[24,24],
    iconAnchor:[12,12]
});

const matchedOfferPin=L.divIcon(
{
    className:"MatchedOfferPin",
    html:
        `<div style="
            width:22px;
            height:22px;
            border-radius:50%;
            background:#2F8F46;
            border:4px solid #F4E8D7;
            box-shadow:0 0 0 5px rgba(47,143,70,0.25),0 3px 10px rgba(0,0,0,0.4);
        "></div>`,
    iconSize:[30,30],
    iconAnchor:[15,15]
});

function normalizeLocation(item)
{
    if(!item)
    {
        return null;
    }

    if(
        item.loc&&
        Array.isArray(item.loc.coordinates)&&
        item.loc.coordinates.length>=2
    )
    {
        const [lng,lat]=item.loc.coordinates;

        if(
            typeof lat==="number"&&
            typeof lng==="number"
        )
        {
            return{
                lat,
                lng
            };
        }
    }

    if(
        item.location&&
        typeof item.location.lat==="number"&&
        typeof item.location.lng==="number"
    )
    {
        return{
            lat:item.location.lat,
            lng:item.location.lng
        };
    }

    if(
        typeof item.lat==="number"&&
        typeof item.lng==="number"
    )
    {
        return{
            lat:item.lat,
            lng:item.lng
        };
    }

    return null;
}

export default function MapDashboard()
{
    const [requests,setRequests]=useState([]);
    const [offers,setOffers]=useState([]);
    const [filter,setFilter]=useState("all");
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");
    const [selectedRequest,setSelectedRequest]=useState(null);
    const [matches,setMatches]=useState([]);
    const [matchedOfferIds,setMatchedOfferIds]=useState([]);
    const [matching,setMatching]=useState(false);
    const [matchError,setMatchError]=useState("");

    const mapRef=useRef(null);

    useEffect(()=>
    {
        loadResources();
    },[]);

    async function loadResources()
    {
        setLoading(true);
        setError("");

        try
        {
            const [requestResponse,offerResponse]=
                await Promise.all(
                [
                    fetch(`${BACKEND}/api/requests`),
                    fetch(`${BACKEND}/api/offers`)
                ]);

            if(!requestResponse.ok)
            {
                throw new Error(
                    "Failed to fetch requests."
                );
            }

            const requestData=
                await requestResponse.json();

            let offerData=[];

            if(offerResponse.ok)
            {
                offerData=
                    await offerResponse.json();
            }

            const normalizedRequests=
                (Array.isArray(requestData)
                    ?requestData
                    :[]
                )
                .map((item)=>
                {
                    const location=
                        normalizeLocation(item);

                    if(!location)
                    {
                        return null;
                    }

                    return{
                        ...item,
                        lat:location.lat,
                        lng:location.lng
                    };
                })
                .filter(Boolean);

            const normalizedOffers=
                (Array.isArray(offerData)
                    ?offerData
                    :[]
                )
                .map((item)=>
                {
                    const location=
                        normalizeLocation(item);

                    if(!location)
                    {
                        return null;
                    }

                    return{
                        ...item,
                        lat:location.lat,
                        lng:location.lng
                    };
                })
                .filter(Boolean);

            setRequests(normalizedRequests);
            setOffers(normalizedOffers);
        }
        catch(error)
        {
            console.error(
                "Map load error:",
                error
            );

            setRequests([]);
            setOffers([]);

            setError(
                "Unable to load community resources."
            );
        }
        finally
        {
            setLoading(false);

            setTimeout(()=>
            {
                if(mapRef.current)
                {
                    mapRef.current.invalidateSize();
                }
            },300);
        }
    }

    async function findMatches(request)
    {
        setSelectedRequest(request);
        setMatchedOfferIds([]);
        setMatches([]);
        setMatchError("");
        setMatching(true);

        try
        {
            const response=await fetch(
                `${BACKEND}/api/matches/request/${request._id}`
            );

            const data=await response.json();

            if(!response.ok)
            {
                throw new Error(
                    data.error||"Failed to find matches."
                );
            }

            const normalizedMatches=
                (Array.isArray(data)
                    ?data
                    :[]
                )
                .map((item)=>
                {
                    const location=
                        normalizeLocation(item);

                    if(!location)
                    {
                        return null;
                    }

                    return{
                        ...item,
                        lat:location.lat,
                        lng:location.lng
                    };
                })
                .filter(Boolean);

            setMatches(normalizedMatches);

            setMatchedOfferIds(
                normalizedMatches.map((offer)=>
                    offer._id
                )
            );
        }
        catch(error)
        {
            console.error(
                "Matching error:",
                error
            );

            setMatchError(
                error.message||"Could not find matches."
            );
        }
        finally
        {
            setMatching(false);
        }
    }

    const visibleRequests=
        filter==="offers"
        ?
        []
        :
        requests;

    const visibleOffers=
        filter==="requests"
        ?
        []
        :
        offers;

    const allResources=
    [
        ...visibleRequests.map((item)=>
        ({
            ...item,
            resourceType:"REQUEST"
        })),

        ...visibleOffers.map((item)=>
        ({
            ...item,
            resourceType:"OFFER"
        }))
    ];

    const firstResource=
        allResources[0];

    const center=
        firstResource
        ?
        [firstResource.lat,firstResource.lng]
        :
        [12.9716,77.5946];

    return(
        <div className="MapDashboard">

            <div className="MapHeader">

                <div>
                    <h1 className="MapTitle">
                        Community Resources
                    </h1>

                    <p className="MapSubtitle">
                        Find people who need help and those offering assistance.
                    </p>
                </div>

            </div>

            <div className="MapControls">

                <button
                    className={
                        filter==="all"
                        ?
                        "FilterButton active"
                        :
                        "FilterButton"
                    }
                    onClick={()=>
                        setFilter("all")
                    }
                >
                    All
                </button>

                <button
                    className={
                        filter==="requests"
                        ?
                        "FilterButton active"
                        :
                        "FilterButton"
                    }
                    onClick={()=>
                        setFilter("requests")
                    }
                >
                    Requests
                </button>

                <button
                    className={
                        filter==="offers"
                        ?
                        "FilterButton active"
                        :
                        "FilterButton"
                    }
                    onClick={()=>
                        setFilter("offers")
                    }
                >
                    Offers
                </button>

            </div>

            <div className="MapContent">

                <div className="MapWrapper">

                    <MapContainer
                        center={center}
                        zoom={12}
                        className="Map"
                        scrollWheelZoom={true}
                        whenReady={(event)=>
                        {
                            mapRef.current=
                                event.target;

                            setTimeout(()=>
                            {
                                event.target.invalidateSize();
                            },300);
                        }}
                    >

                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />

                        {visibleRequests.map((request)=>
                        (
                            <Marker
                                key={`request-${request._id}`}
                                position={
                                    [
                                        request.lat,
                                        request.lng
                                    ]
                                }
                                icon={requestPin}
                            >

                                <Popup>
                                    <div className="MapPopup">

                                        <span className="PopupType request">
                                            REQUEST
                                        </span>

                                        <h3>
                                            {
                                                request.category||
                                                "Request"
                                            }
                                        </h3>

                                        <p>
                                            {
                                                request.details||
                                                "No details provided."
                                            }
                                        </p>

                                        {
                                            request.locationLabel&&
                                            <span className="PopupLocation">
                                                {request.locationLabel}
                                            </span>
                                        }

                                        <button
                                            className="MatchButton"
                                            onClick={()=>
                                                findMatches(request)
                                            }
                                        >
                                            Find Matching Offers
                                        </button>

                                    </div>
                                </Popup>

                            </Marker>
                        ))}

                        {visibleOffers.map((offer)=>
                        (
                            <Marker
                                key={`offer-${offer._id}`}
                                position={
                                    [
                                        offer.lat,
                                        offer.lng
                                    ]
                                }
                                icon={
                                    matchedOfferIds.includes(offer._id)
                                    ?
                                    matchedOfferPin
                                    :
                                    offerPin
                                }
                            >

                                <Popup>
                                    <div className="MapPopup">

                                        <span className="PopupType offer">
                                            OFFER
                                        </span>

                                        <h3>
                                            {
                                                offer.category||
                                                "Offer"
                                            }
                                        </h3>

                                        <p>
                                            {
                                                offer.resources||
                                                "No details provided."
                                            }
                                        </p>

                                        {
                                            offer.locationLabel&&
                                            <span className="PopupLocation">
                                                {offer.locationLabel}
                                            </span>
                                        }

                                    </div>
                                </Popup>

                            </Marker>
                        ))}

                    </MapContainer>

                </div>

                <aside className="ResourcePanel">

                    <h2 className="ResourcePanelTitle">
                        Nearby Resources
                    </h2>

                    {
                        selectedRequest&&
                        <div className="MatchPanel">

                            <h3>
                                Matching Offers
                            </h3>

                            <p>
                                {
                                    selectedRequest.category
                                }
                            </p>

                            {
                                matching&&
                                <div className="EmptyResources">
                                    Finding matching offers...
                                </div>
                            }

                            {
                                !matching&&
                                matchError&&
                                <div className="EmptyResources">
                                    {matchError}
                                </div>
                            }

                            {
                                !matching&&
                                !matchError&&
                                matches.length===0&&
                                <div className="EmptyResources">
                                    No matching offers found.
                                </div>
                            }

                            {
                                !matching&&
                                !matchError&&
                                matches.map((offer,index)=>
                                (
                                    <div
                                        className="ResourceCard"
                                        key={
                                            `match-${offer._id||index}`
                                        }
                                    >

                                        <span className="ResourceType">
                                            OFFER
                                        </span>

                                        <h3 className="ResourceTitle">
                                            {
                                                offer.category||
                                                "Offer"
                                            }
                                        </h3>

                                        <p className="ResourceLocation">
                                            {
                                                offer.locationLabel||
                                                "Location unavailable"
                                            }
                                        </p>

                                        <p className="ResourceDetails">
                                            {
                                                offer.resources||
                                                "Community assistance available."
                                            }
                                        </p>

                                    </div>
                                ))
                            }

                        </div>
                    }

                    {
                        loading&&
                        <div className="EmptyResources">
                            <p>
                                Loading resources...
                            </p>
                        </div>
                    }

                    {
                        !loading&&error&&
                        <div className="EmptyResources">
                            <p>
                                {error}
                            </p>
                        </div>
                    }

                    {
                        !loading&&
                        !error&&
                        allResources.length===0&&
                        <div className="EmptyResources">
                            <p>
                                No resources to display yet.
                            </p>

                            <span>
                                Submit a request or offer to get started.
                            </span>
                        </div>
                    }

                    {
                        !loading&&
                        !error&&
                        allResources.map((resource,index)=>
                        (
                            <div
                                className="ResourceCard"
                                key={
                                    `${resource.resourceType}-${resource._id||index}`
                                }
                            >

                                <span className="ResourceType">
                                    {resource.resourceType}
                                </span>

                                <h3 className="ResourceTitle">
                                    {
                                        resource.category||
                                        "Community Resource"
                                    }
                                </h3>

                                <p className="ResourceLocation">
                                    {
                                        resource.locationLabel||
                                        "Bengaluru"
                                    }
                                </p>

                                <p className="ResourceDetails">
                                    {
                                        resource.details||
                                        resource.resources||
                                        "Community assistance available."
                                    }
                                </p>

                            </div>
                        ))
                    }

                </aside>

            </div>

        </div>
    );
}