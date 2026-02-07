import React from "react";
import "./Spinner.scss";

const Spinner = ({ size = 60, color = "#1e90ff", text = "Loading shelters..." }) => {
  return (
    <div className="modern-spinner-wrapper">
      <div
        className="modern-spinner"
        style={{ width: size, height: size, borderColor: color }}
      >
        <div className="modern-spinner__ring"></div>
        <div className="modern-spinner__ring"></div>
      </div>
      <p className="modern-spinner-text">{text}</p>
    </div>
  );
};

export default Spinner;