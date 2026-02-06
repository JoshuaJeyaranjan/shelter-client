import React, { useEffect, useState } from "react";
import { getLocationsForMap } from "../../api/shelters";
import "./SheltersMapPage.scss";
import SheltersMap from "../../components/SheltersMap/SheltersMap";
import Nav from "../../components/Nav/Nav";
import ShelterDisclaimer from "../../components/ShelterDisclaimer/ShelterDisclaimer";
const SheltersMapPage = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShelters = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getLocationsForMap();

        if (!Array.isArray(data)) {
          console.warn("Unexpected API response:", data);
          setShelters([]);
        } else {
          setShelters(data);
        }
      } catch (err) {
        console.error("Error fetching shelters:", err);
        setError("Failed to load shelters. Please try again later.");
        setShelters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShelters();
  }, []);

  return (
    <>
    <ShelterDisclaimer />
      <Nav />
      <div className="shelters-map-page">
        <h1>Toronto Shelters Map</h1>

        {loading ? (
          <p>Loading shelters...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
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
