// NavBar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Nav.scss";

const Nav = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Home", path: "/" },
    { name: "Map", path: "/shelter-map" },
    { name: "Resources", path: "/resources" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <div className="navbar-logo">
          <Link to="/">🏠 Shelter Toronto</Link>
        </div>
        <button
          className="navbar-toggle"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
      </div>

      <ul className={`navbar-links ${isOpen ? "open" : ""}`}>
        {links.map((link) => (
          <li
            key={link.name}
            className={location.pathname === link.path ? "active" : ""}
          >
            <Link to={link.path} onClick={() => setIsOpen(false)}>
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Nav;
