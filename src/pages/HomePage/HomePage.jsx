import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.scss";
import ShelterList from "../../components/ShelterList/ShelterList";

const HomePage = () => {
  return (
    <div className="home-container">
      <header className="hero">
        <h1>Find Shelter Toronto</h1>
        <p>Find shelters and foodbanks in Toronto based on your needs.</p>
      </header>

      <section className="info">
        <h2>How it works</h2>
        <p>
          Search for shelters by sector, city, and availability. 
          Get occupancy information in real time to find the support you deserve.
        </p>
      </section>

        <div className="shelter-list-section"> 
          <ShelterList />   
          </div>

    </div>
  );
};

export default HomePage;