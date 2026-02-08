import { Link } from "react-router-dom"; 
import "./HomePage.scss";
import ShelterList from "../../components/ShelterList/ShelterList";
import Nav from "../../components/Nav/Nav";
import ShelterDisclaimer from "../../components/ShelterDisclaimer/ShelterDisclaimer";
import Footer from "../../components/Footer/Footer";
import BackToTop from "../../components/BackToTop/BackToTop";
const HomePage = () => {
  return (
    <>
      <ShelterDisclaimer />
      <Nav />

      <div className="home-container">
        <header className="hero">
          <h1>Find Shelter Toronto</h1>
        </header>

        <div className="shelter-list-section">
          <ShelterList />
        </div>
      </div>
      <BackToTop />
      <Footer />
    </>
  );
};

export default HomePage;
