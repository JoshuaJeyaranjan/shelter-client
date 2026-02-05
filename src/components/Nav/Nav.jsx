// NavBar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Nav.scss";

const Nav = () => {
  const location = useLocation();

  const links = [
    { name: "Home", path: "/" },
    { name: "Map", path: "/shelter-map" },
    { name: "Resources", path: "/resources" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">🏠 Shelter Toronto</Link>
      </div>
      <ul className="navbar-links">
        {links.map((link) => (
          <li
            key={link.name}
            className={location.pathname === link.path ? "active" : ""}
          >
            <Link to={link.path}>{link.name}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Nav;
