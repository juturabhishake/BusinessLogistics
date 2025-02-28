"use client";
import React from "react";

const StaticPage = () => {
  return (

    <div className="bg-card p-4 rounded-lg shadow-lg">
        
    <div style={{ padding: "20px" }}>
      <h1 style={{ color: "#2a9d90" }}>Shipping Terms and Conditions</h1>

      <section style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "#2a9d90" }}>Port of Loading</h2>
        <p>Chennai & Nhavasheva</p>
      </section>

      <section style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "#2a9d90" }}>Shipper Address</h2>
        <address>
          GREENTECH INDUSTRIES (INDIA) PRIVATE LIMITED
          <br />
          MULTI PRODUCT SPECIAL ECONOMIC ZONE
          <br />
          DWARAKAPURAM VILLAGE, NAIDUPET MANDAL
          <br />
          SPSR NELLORE DISTRICT, ANDHRA PRADESH –524421, India
        </address>
      </section>

      <section style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "#2a9d90" }}>Important Terms and Conditions</h2>
        <ul>
          <li>1. During the agreed period, no price revision will be accepted.</li>
          <li>
            2. If the forwarder wants a price revision, they will be removed from
            that region and blacklisted in our system.
          </li>
          <li>
            3. The shipments should be delivered On-time as per the committed
            schedule. No increase in transit days will be acceptable.
          </li>
          <li>
            4. The nominated forwarder has to take full responsibility for the
            penalty if any delay in delivery leads to production line stoppages,
            additional transportation, storage charges, or bad weather conditions
            resulting in vessel delays.
          </li>
          <li>
            5. Blank sailing of vessels, equipment shortage (imbalance of
            containers), and any related issues should be communicated 4 weeks
            beforehand. Last-minute information leading to line stoppages will
            result in costs borne by the nominated forwarder.
          </li>
        </ul>
      </section>

      <section>
        <h2 style={{ color: "#2a9d90" }}>Bonded Agreement</h2>
        <p>
          The nominated forwarder needs to sign our bonded agreement for the
          contract period and agree to the terms and conditions mentioned above.
        </p>
      </section>
    </div>
    </div>
    
  );
};

export default StaticPage;
