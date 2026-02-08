import React from "react";
import "./Footer.scss";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__content">
        <p className="footer__text">
          © {currentYear} Shelter Toronto ❤️. All rights reserved.
        </p>
        <div className="footer__links">
          <a href="https://open.toronto.ca/dataset/daily-shelter-overnight-service-occupancy-capacity/" target="_blank" rel="noopener noreferrer">
            City of Toronto Open Data
          </a>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;