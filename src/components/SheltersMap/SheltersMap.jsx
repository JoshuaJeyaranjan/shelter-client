import React, { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "./SheltersMap.scss";

// Helper to create an SVG marker icon
const createMarkerIcon = (color) => {
  return L.divIcon({
    className: "",
    html: `
      <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0 C23 0 30 7 30 15 C30 25 15 42 15 42 C15 42 0 25 0 15 C0 7 7 0 15 0 Z" fill="${color}" />
        <circle cx="15" cy="15" r="6" fill="white" />
      </svg>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -40],
  });
};

// Helper to generate Google Maps link
const getGoogleMapsLink = (shelter) => {
  if (!shelter.address || !shelter.city) return "#";
  const query = encodeURIComponent(
    `${shelter.address}, ${shelter.city}, ${shelter.province || ""}`
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

// Helper to determine marker color based on sector
const getSectorColor = (shelter) => {
  const sectorLower = (shelter.sector || "").toLowerCase();
  if (sectorLower.includes("families")) return "#2ecc71";
  if (sectorLower.includes("men") && !sectorLower.includes("women")) return "#3498db";
  if (sectorLower.includes("women")) return "#e91ed1ff";
  if (sectorLower.includes("mixed adult")) return "#f39c12";
  if (sectorLower.includes("youth")) return "#fcff42f5";
  return "#95a5a6"; // default gray
};

const SheltersMap = ({ shelters }) => {
  const [filters, setFilters] = useState({ sector: "", city: "" });
  const [showFullCapacity, setShowFullCapacity] = useState(false);

  // Unique options for filters
  const sectors = useMemo(() => Array.from(new Set(shelters.map(s => s.sector).filter(Boolean))).sort(), [shelters]);
  const cities = useMemo(() => Array.from(new Set(shelters.map(s => s.city).filter(Boolean))).sort(), [shelters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Filtered shelters
  const filteredShelters = useMemo(() => {
    return shelters.filter(s => {
      if (!s.latitude || !s.longitude) return false;

      const fullCapacity =
        (s.capacity_actual_bed && s.occupied_beds >= s.capacity_actual_bed) ||
        (s.capacity_actual_room && s.occupied_rooms >= s.capacity_actual_room);

      if (!showFullCapacity && fullCapacity) return false;

      if (filters.sector && s.sector !== filters.sector) return false;
      if (filters.city && s.city !== filters.city) return false;

      return true;
    });
  }, [shelters, filters, showFullCapacity]);

  // Map center
  const defaultCenter = [43.65107, -79.347015]; // Toronto fallback
  const mapCenter = filteredShelters.length
    ? [filteredShelters[0].latitude, filteredShelters[0].longitude]
    : defaultCenter;

  return (
    <div className="shelters-map-container">
      <div className="map-filters">
        <select name="sector" value={filters.sector} onChange={handleFilterChange}>
          <option value="">All Sectors</option>
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select name="city" value={filters.city} onChange={handleFilterChange}>
          <option value="">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <button
          className="toggle-full-capacity"
          onClick={() => setShowFullCapacity(prev => !prev)}
        >
          {showFullCapacity ? "Hide Full Capacity Shelters" : "Show Full Capacity Shelters"}
        </button>
      </div>

      <MapContainer center={mapCenter} zoom={12} style={{ height: "500px", width: "100%", borderRadius: "8px" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {filteredShelters.map(shelter => {
          const fullCapacity =
            (shelter.capacity_actual_bed && shelter.occupied_beds >= shelter.capacity_actual_bed) ||
            (shelter.capacity_actual_room && shelter.occupied_rooms >= shelter.capacity_actual_room);

          const markerColor = fullCapacity ? "#ff4d4f" : getSectorColor(shelter);

          return (
            <Marker
              key={shelter.id}
              position={[shelter.latitude, shelter.longitude]}
              icon={createMarkerIcon(markerColor)}
            >
              <Popup>
                <strong>{shelter.location_name}</strong><br />
                {shelter.address && (
                  <a href={getGoogleMapsLink(shelter)} target="_blank" rel="noopener noreferrer">
                    {shelter.address}, {shelter.city}, {shelter.province}
                  </a>
                )}<br />
                {shelter.capacity_actual_bed && (
                  <span>Beds: {shelter.occupied_beds || 0} / {shelter.capacity_actual_bed}<br /></span>
                )}
                {shelter.capacity_actual_room && (
                  <span>Rooms: {shelter.occupied_rooms || 0} / {shelter.capacity_actual_room}<br /></span>
                )}
                {fullCapacity && <strong style={{ color: "#ff4d4f" }}>⚠ Full Capacity</strong>}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="map-legend">
        <span><svg width="15" height="15"><circle cx="7" cy="7" r="7" fill="#2ecc71" /></svg> Families</span>
        <span><svg width="15" height="15"><circle cx="7" cy="7" r="7" fill="#3498db" /></svg> Men</span>
        <span><svg width="15" height="15"><circle cx="7" cy="7" r="7" fill="#e91ed1ff" /></svg> Women</span>
        <span><svg width="15" height="15"><circle cx="7" cy="7" r="7" fill="#f39c12" /></svg> Mixed Adult</span>
        <span><svg width="15" height="15"><circle cx="7" cy="7" r="7" fill="#fcff42f5" /></svg> Youth</span>
        <span><svg width="15" height="15"><circle cx="7" cy="7" r="7" fill="#ff4d4f" /></svg> Full Capacity</span>
        <span><svg width="15" height="15"><circle cx="7" cy="7" r="7" fill="#95a5a6" /></svg> Other / Unknown</span>
      </div>
    </div>
  );
};

export default SheltersMap;