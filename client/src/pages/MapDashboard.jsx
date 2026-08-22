import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/MapDashboard.css";

export default function MapDashboard()
{
    const [filter,setFilter]=useState("all");

    return(
        <div className="MapDashboard">
            <div className="MapHeader">
                <div>
                    <h1 className="MapTitle">Community Resources</h1>
                    <p className="MapSubtitle">
                        Find people who need help and those offering assistance.
                    </p>
                </div>

                <div className="MapActions">
                    <Link to="/request" className="MapRequestButton">
                        Request Help
                    </Link>

                    <Link to="/offer" className="MapOfferButton">
                        Offer Help
                    </Link>
                </div>
            </div>

            <div className="MapControls">
                <button
                    className={filter==="all"?"FilterButton active":"FilterButton"}
                    onClick={()=>setFilter("all")}
                >
                    All
                </button>

                <button
                    className={filter==="requests"?"FilterButton active":"FilterButton"}
                    onClick={()=>setFilter("requests")}
                >
                    Requests
                </button>

                <button
                    className={filter==="offers"?"FilterButton active":"FilterButton"}
                    onClick={()=>setFilter("offers")}
                >
                    Offers
                </button>
            </div>

            <div className="MapContent">
                <div className="MapPlaceholder">
                    <div className="MapIcon">◎</div>
                    <h2>Resource Map</h2>
                    <p>
                        Community requests and offers will appear here.
                    </p>
                </div>

                <aside className="ResourcePanel">
                    <h2>Nearby Resources</h2>

                    <div className="EmptyResources">
                        <p>No resources to display yet.</p>
                        <span>
                            Submit a request or offer to get started.
                        </span>
                    </div>
                </aside>
            </div>
        </div>
    );
}