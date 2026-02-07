import React, { useState } from "react";
import "./ShelterDisclaimer.scss";

const ShelterDisclaimer = () => {
  const [isVisible, setIsVisible] = useState(true);

  const toggle = () => setIsVisible((v) => !v);

  const onKeyDownToggle = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div className="shelter-disclaimer-container">
      {isVisible ? (
        <div
          className="disclaimer-card"
          role="button"
          tabIndex={0}
          onClick={toggle}
          onKeyDown={onKeyDownToggle}
          aria-expanded={isVisible}
        >
          <h2 className="disclaimer-title">Important Disclaimer</h2>
          <p className="disclaimer-text">
            The occupancy and capacity data shown on this site is{" "}
            <strong>not real-time</strong>. It reflects a historical snapshot at
            the end of each week day and may not reflect current availability.{" "}
            <strong>
              Shelter spaces are dynamic and can change throughout the day.
            </strong>
          </p>
          <p className="disclaimer-text">
            Each shelter may have eligibility requirements which are{" "}
            <strong>not included</strong> here.
          </p>
          <p className="disclaimer-text">
            For <strong> more accurate and up-to-date information</strong>,
            please contact
            <a
              href="tel:4163384766"
              className="top-disclaimer-link"
              onClick={(e) => e.stopPropagation()}
            >
              Toronto Central Intake
            </a>{" "}
            <strong>before attempting to visit a shelter.</strong> <br></br>{" "}
            This site is intended for informational purposes only.
          </p>
        </div>
      ) : (
        <button onClick={toggle} className="show-btn" aria-expanded={isVisible}>
          Show Shelter Disclaimer
        </button>
      )}
    </div>
  );
};

export default ShelterDisclaimer;
