import { Link } from "react-router-dom"; // <-- import Link
import "./HomePage.scss";
import ShelterList from "../../components/ShelterList/ShelterList";
import Nav from "../../components/Nav/Nav";
import ShelterDisclaimer from "../../components/ShelterDisclaimer/ShelterDisclaimer";
const HomePage = () => {
  return (
    <>
    <ShelterDisclaimer/>
    <Nav/>
    
    <div className="home-container">
        
      <header className="hero">
        <h1>Find Shelter Toronto</h1>
        

        {/* Find Shelters Button */}
        <Link to="/shelter-map" className="btn find-shelters-btn">
          Find Shelters
        </Link>
      </header>


      <div className="shelter-list-section"> 
        <ShelterList />   
      </div>
    </div>

    </>
  );
};

export default HomePage;