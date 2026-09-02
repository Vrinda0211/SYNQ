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
    const [selectedResource,setSelectedResource]=useState(null);
    const [matches,setMatches]=useState([]);
    const [matchesLoading,setMatchesLoading]=useState(false);

    const mapRef=useRef(null);
    const markerRefs=useRef({});

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
                throw new Error("Failed to fetch requests.");
            }

            const requestData=await requestResponse.json();

            let offerData=[];

            if(offerResponse.ok)
            {
                offerData=await offerResponse.json();
            }

            const normalizedRequests=
                (Array.isArray(requestData)
                    ?requestData
                    :[]
                )
                .map((item)=>
                {
                    const location=normalizeLocation(item);

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
                    const location=normalizeLocation(item);

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
            console.error("Map load error:",error);
            setRequests([]);
            setOffers([]);
            setError("Unable to load community resources.");
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

    async function loadMatches(request)
    {
        if(!request||!request._id)
        {
            setMatches([]);
            return;
        }

        setMatchesLoading(true);

        try
        {
            const response=await fetch(
                `${BACKEND}/api/requests/${request._id}/matches`
            );

            if(!response.ok)
            {
                throw new Error("Failed to fetch matches.");
            }

            const data=await response.json();

            const normalizedMatches=
                (Array.isArray(data)
                    ?data
                    :[]
                )
                .map((item)=>
                {
                    const location=normalizeLocation(item);

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
        }
        catch(error)
        {
            console.error("Match load error:",error);
            setMatches([]);
        }
        finally
        {
            setMatchesLoading(false);
        }
    }

    function selectResource(resource)
    {
        setSelectedResource(resource);

        if(resource.resourceType==="REQUEST")
        {
            loadMatches(resource);
        }
        else
        {
            setMatches([]);
        }

        const key=resourceKey(resource);
        const marker=markerRefs.current[key];

        if(marker&&mapRef.current)
        {
            mapRef.current.setView(
                [resource.lat,resource.lng],
                14
            );

            setTimeout(()=>
            {
                marker.openPopup();
            },200);
        }
    }

    function resourceKey(resource)
    {
        return `${resource.resourceType}-${resource._id}`;
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

    const firstResource=allResources[0];

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
                    {
                        setFilter("all");
                        setSelectedResource(null);
                        setMatches([]);
                    }}
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
                    {
                        setFilter("requests");
                        setSelectedResource(null);
                        setMatches([]);
                    }}
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
                    {
                        setFilter("offers");
                        setSelectedResource(null);
                        setMatches([]);
                    }}
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
                            mapRef.current=event.target;

                            setTimeout(()=>
                            {
                                event.target.invalidateSize();
                            },300);
                        }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />

                        {visibleRequests.map((request)=>
                        {
                            const key=`request-${request._id}`;

                            return(
                                <Marker
                                    key={key}
                                    position={[
                                        request.lat,
                                        request.lng
                                    ]}
                                    icon={requestPin}
                                    ref={(marker)=>
                                    {
                                        if(marker)
                                        {
                                            markerRefs.current[key]=marker;
                                        }
                                    }}
                                    eventHandlers={{
                                        click:()=>
                                        {
                                            selectResource(
                                            {
                                                ...request,
                                                resourceType:"REQUEST"
                                            });
                                        }
                                    }}
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
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}

                        {visibleOffers.map((offer)=>
                        {
                            const key=`offer-${offer._id}`;

                            return(
                                <Marker
                                    key={key}
                                    position={[
                                        offer.lat,
                                        offer.lng
                                    ]}
                                    icon={offerPin}
                                    ref={(marker)=>
                                    {
                                        if(marker)
                                        {
                                            markerRefs.current[key]=marker;
                                        }
                                    }}
                                    eventHandlers={{
                                        click:()=>
                                        {
                                            selectResource(
                                            {
                                                ...offer,
                                                resourceType:"OFFER"
                                            });
                                        }
                                    }}
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
                            );
                        })}
                    </MapContainer>
                </div>

                <aside className="ResourcePanel">
                    <h2 className="ResourcePanelTitle">
                        Nearby Resources
                    </h2>

                    {loading&&
                        <div className="EmptyResources">
                            <p>Loading resources...</p>
                        </div>
                    }

                    {!loading&&error&&
                        <div className="EmptyResources">
                            <p>{error}</p>
                        </div>
                    }

                    {!loading&&!error&&allResources.length===0&&
                        <div className="EmptyResources">
                            <p>No resources to display yet.</p>
                            <span>
                                Submit a request or offer to get started.
                            </span>
                        </div>
                    }

                    {!loading&&!error&&
                        allResources.map((resource,index)=>
                        {
                            const key=
                                `${resource.resourceType}-${resource._id||index}`;

                            const isSelected=
                                selectedResource&&
                                resourceKey(selectedResource)===key;

                            return(
                                <div
                                    className={
                                        isSelected
                                        ?
                                        "ResourceCard selected"
                                        :
                                        "ResourceCard"
                                    }
                                    key={key}
                                    onClick={()=>
                                        selectResource(resource)
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

                                    <button
                                        type="button"
                                        className="ResourceMapButton"
                                        onClick={(event)=>
                                        {
                                            event.stopPropagation();
                                            selectResource(resource);
                                        }}
                                    >
                                        View on Map
                                    </button>

                                    {
                                        isSelected&&
                                        resource.resourceType==="REQUEST"&&
                                        <div className="MatchSection">
                                            <h4 className="MatchTitle">
                                                Potential Helpers
                                            </h4>

                                            {
                                                matchesLoading&&
                                                <p className="MatchMessage">
                                                    Finding nearby helpers...
                                                </p>
                                            }

                                            {
                                                !matchesLoading&&
                                                matches.length===0&&
                                                <p className="MatchMessage">
                                                    No matching offers found nearby.
                                                </p>
                                            }

                                            {
                                                !matchesLoading&&
                                                matches.map((match)=>
                                                (
                                                    <div
                                                        className="MatchCard"
                                                        key={match._id}
                                                        onClick={(event)=>
                                                        {
                                                            event.stopPropagation();
                                                            selectResource(
                                                            {
                                                                ...match,
                                                                resourceType:"OFFER"
                                                            });
                                                        }}
                                                    >
                                                        <span className="MatchCategory">
                                                            OFFER
                                                        </span>

                                                        <strong>
                                                            {
                                                                match.resources||
                                                                "Help available"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                match.locationLabel||
                                                                "Nearby"
                                                            }
                                                        </span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    }
                                </div>
                            );
                        })
                    }
                </aside>
            </div>
        </div>
    );
}