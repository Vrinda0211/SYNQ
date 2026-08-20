import React from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";

export default function Home()
{
  return(
    <div className="Home">
      <div className="Background">
        <div className="Text">
          <h1 className="Title">
            Community Disaster Resource Coordination Platform
          </h1>

          <p className="Subtitle">
            Connecting those in need with those who can help in emergencies.
          </p>

          <div className="Buttons">
            <Link to="/request" className="RequestButton">
              Request Help
            </Link>

            <Link to="/offer" className="OfferButton">
              Offer Help
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
