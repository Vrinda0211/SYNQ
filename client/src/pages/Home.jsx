import React from "react";
import "client\src\styles\Home.css";

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
            <a href="#/request" className="RequestButton">
              Request Help
            </a>

            <a href="#/offer" className="OfferButton">
              Offer Help
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
