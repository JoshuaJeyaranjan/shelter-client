// SheltersMapPage.jsx
import React, { useEffect, useState } from "react";
import { getShelters } from "../../api/shelters"; // use your existing API function
import "./SheltersMapPage.scss";
import SheltersMap from "../../components/SheltersMap/SheltersMap";
import Nav from "../../components/Nav/Nav";
const SheltersMapPage = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShelters = async () => {
      setLoading(true);
      try {
        const { shelters: data } = await getShelters();
        setShelters(data);
      } catch (err) {
        console.error("Error fetching shelters:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShelters();
  }, []);

  return (
    <>
    <Nav/>
    <div className="shelters-map-page">
      <h1>Toronto Shelters Map</h1>

      {loading ? (
        <p>Loading shelters...</p>
      ) : shelters.length === 0 ? (
        <p>No shelters available to display.</p>
      ) : (
        <SheltersMap shelters={shelters} />
      )}
    </div>
    </>
  );
};

export default SheltersMapPage;