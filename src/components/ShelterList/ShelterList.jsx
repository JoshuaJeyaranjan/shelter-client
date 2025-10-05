import React, { useState, useEffect } from "react";
import { getShelters } from "../../api/shelters";
import { getSheltersMetadata } from "../../api/metadata";
import "./ShelterList.scss";


const ShelterList = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sector: "",
    city: "",
    minVacancyBeds: "",
    minVacancyRooms: "",
  });
  const [sectors, setSectors] = useState([]);
  const [cities, setCities] = useState([]);
  const [showFullCapacity, setShowFullCapacity] = useState(false);
  const [metadata, setMetadata] = useState({ lastRefreshed: null });

  const getGoogleMapsLink = (shelter) => {
  if (!shelter.address || !shelter.city) return "#";
  const query = encodeURIComponent(
    `${shelter.address}, ${shelter.city}, ${shelter.province || ""}`
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

// Fetch Metadata
useEffect(() => {
  const fetchMetadata = async () => {
    const meta = await getSheltersMetadata();
    setMetadata(meta);
  };
  fetchMetadata();
}, [])

  // Fetch shelters from API 
const fetchShelters = async () => {
  setLoading(true);
  try {
    // Call API
    const { shelters: fetchedShelters, metadata: fetchedMetadata } = await getShelters(filters);

    // Ensure we have an array
    const sheltersArray = Array.isArray(fetchedShelters) ? fetchedShelters : [];

    // Sort by most unoccupied rooms first, then beds
    const sorted = sheltersArray.sort((a, b) => {
      const roomsDiff = (b.unoccupied_rooms || 0) - (a.unoccupied_rooms || 0);
      if (roomsDiff !== 0) return roomsDiff;
      return (b.unoccupied_beds || 0) - (a.unoccupied_beds || 0);
    });

    // Update state
    setShelters(sorted);
    

    // Extract unique sectors and cities for filters
    setSectors(Array.from(new Set(sorted.map(s => s.sector).filter(Boolean))).sort());
    setCities(Array.from(new Set(sorted.map(s => s.city).filter(Boolean))).sort());
  } catch (err) {
    console.error("Error fetching shelters:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchShelters();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => fetchShelters();

  // Compute X/Y summary
  const totalShelters = shelters.length;
  const availableShelters = shelters.filter(
    s => (s.unoccupied_beds > 0 || s.unoccupied_rooms > 0)
  ).length;

  console.log(metadata)

  return (
    <div className="shelter-list-container">
      <h1>Toronto Shelters</h1>



      <div className="filters">
        <select name="sector" value={filters.sector} onChange={handleFilterChange}>
          <option value="">All Sectors</option>
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select name="city" value={filters.city} onChange={handleFilterChange}>
          <option value="">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <input
          type="number"
          placeholder="Min Beds"
          name="minVacancyBeds"
          value={filters.minVacancyBeds}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          placeholder="Min Rooms"
          name="minVacancyRooms"
          value={filters.minVacancyRooms}
          onChange={handleFilterChange}
        />

        <button onClick={applyFilters}>Search</button>
      </div>

      <div style={{ margin: "1rem 0" }}>
        <button onClick={() => setShowFullCapacity(!showFullCapacity)}>
          {showFullCapacity ? "Hide Full Capacity Shelters" : "Show Full Capacity Shelters"}
        </button>
      </div>

      <div className="shelter-summary" style={{ marginBottom: "1rem" }}>
        Showing {showFullCapacity ? totalShelters : availableShelters} out of {totalShelters} shelters
      </div>

{metadata?.lastRefreshed && (
<div className="last-refreshed">
  Last Refreshed: {metadata.lastRefreshed ? new Date(metadata.lastRefreshed).toLocaleString() : "N/A"}
</div>
)}

      {loading ? (
        <p>Loading shelters...</p>
      ) : shelters.length === 0 ? (
        <p>No shelters found.</p>
      ) : (
<ul className="shelter-list">
  {shelters
    .filter(s => showFullCapacity || (s.unoccupied_beds > 0 || s.unoccupied_rooms > 0))
    .map(shelter => {
      const fullCapacity =
        (shelter.capacity_actual_bed != null && (shelter.occupied_beds || 0) >= shelter.capacity_actual_bed) &&
        (shelter.capacity_actual_room != null && (shelter.occupied_rooms || 0) >= shelter.capacity_actual_room);

      return (
        <li
          key={shelter.id}
          className={`shelter-item ${fullCapacity ? "full-capacity" : ""}`}
        >
          <h3>{shelter.location_name}</h3>
          <p><strong>Organization:</strong> {shelter.organization_name || "N/A"}</p>
          <p><strong>Group:</strong> {shelter.shelter_group || "N/A"}</p>
          <p><strong>Program:</strong> {shelter.program_name || "N/A"}</p>
          <p><strong>Sector:</strong> {shelter.sector || "N/A"}</p>
          <p><strong>Service Type:</strong> {shelter.overnight_service_type || "N/A"}</p>
          <p>
  <strong>📍 Address:</strong>{" "}
  {shelter.address ? (
    <a
      href={getGoogleMapsLink(shelter)}
      target="_blank"
      rel="noopener noreferrer"
    >
      {shelter.address}, {shelter.city}, {shelter.province} {shelter.postal_code}
    </a>
  ) : (
    "N/A"
  )}
</p>          
          <p><strong>Beds:</strong> {shelter.occupied_beds || 0} / {shelter.capacity_actual_bed || "N/A"}</p>
          <p><strong>Rooms:</strong> {shelter.occupied_rooms || 0} / {shelter.capacity_actual_room || "N/A"}</p>
          <p><strong>Last Updated:</strong> {shelter.occupancy_date ? new Date(shelter.occupancy_date).toLocaleDateString() : "N/A"}</p>
          {fullCapacity && <span className="full-capacity-indicator">⚠ Full Capacity</span>}
        </li>
      );
    })}
</ul>
      )}
    </div>
  );
};

export default ShelterList;