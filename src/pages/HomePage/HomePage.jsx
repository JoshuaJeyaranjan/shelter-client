import { Link } from "react-router-dom"; // <-- import Link
import "./HomePage.scss";
import ShelterList from "../../components/ShelterList/ShelterList";
import Nav from "../../components/Nav/Nav";
const HomePage = () => {
  return (
    <>
    <Nav/>
    
    <div className="home-container">
        
      <header className="hero">
        <h1>Find Shelter Toronto</h1>
        <p>Find shelters and foodbanks in Toronto based on your needs.</p>

        {/* Find Shelters Button */}
        <Link to="/shelter-map" className="btn find-shelters-btn">
          Find Shelters
        </Link>
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

    </>
  );
};

export default HomePage;