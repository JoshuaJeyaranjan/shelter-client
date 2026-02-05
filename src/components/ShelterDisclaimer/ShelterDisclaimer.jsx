import React, { useState } from "react";
import "./ShelterDisclaimer.scss";

const ShelterDisclaimer = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="shelter-disclaimer-container">
      {isVisible ? (
        <div className="disclaimer-card">
          <button
            onClick={() => setIsVisible(false)}
            className="close-btn"
            aria-label="Hide disclaimer"
          >
            ✕
          </button>
          <h2 className="disclaimer-title">Important Disclaimer</h2>
          <p className="disclaimer-text">
            The occupancy and capacity data shown on this site is{" "}
            <strong>not real-time</strong>. It reflects a historical snapshot at
            the end of each week day and may not reflect current availability.
            <strong>
              Shelter spaces are dynamic and can change throughout the day.
            </strong>
          </p>
          <p className="disclaimer-text">
            Each shelter may have eligibility requirements which are{" "}
            <strong>not included</strong> here.
          </p>
          <p className="disclaimer-text">
            For <strong>accurate and up-to-date information</strong>, please
            contact{" "}
            <a href="tel:4163384766" className="disclaimer-link">
              Toronto Central Intake
            </a>{" "}
            before attempting to visit a shelter. This site is intended for
            informational purposes only.
          </p>
        </div>
      ) : (
        <button onClick={() => setIsVisible(true)} className="show-btn">
          Show Shelter Disclaimer
        </button>
      )}
    </div>
  );
};

export default ShelterDisclaimer;
