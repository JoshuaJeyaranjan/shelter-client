import React, { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "./SheltersMap.scss";

// Marker icon helper
const createMarkerIcon = (color) => L.divIcon({
  className: "",
  html: `
    <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0 C23 0 30 7 30 15 C30 25 15 42 15 42 C15 42 0 25 0 15 C0 7 7 0 15 0 Z" fill="${color}" />
      <circle cx="15" cy="15" r="6" fill="white" />
    </svg>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -40],
});

// Google Maps link helper
const getGoogleMapsLink = (shelter) =>
  shelter.address && shelter.city
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${shelter.address}, ${shelter.city}, ${shelter.province || ""}`
      )}`
    : "#";

// Haversine distance
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Recenter component
const RecenterOnUser = ({ userLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (userLocation) map.flyTo([userLocation.latitude, userLocation.longitude], 13, { duration: 1.5 });
  }, [userLocation]);
  return null;
};

const SheltersMap = ({ shelters }) => {
  const [filters, setFilters] = useState({ sector: "", city: "" });
  const [showFullCapacity, setShowFullCapacity] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => console.warn("Geolocation unavailable:", err)
    );
  }, []);

  // Flatten programs for filters
  const allPrograms = useMemo(() => shelters.flatMap(s => s.programs), [shelters]);
  const sectors = useMemo(() => Array.from(new Set(allPrograms.map(p => p.sector).filter(Boolean))).sort(), [allPrograms]);
  const cities = useMemo(() => Array.from(new Set(shelters.map(s => s.city).filter(Boolean))).sort(), [shelters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Marker color based on programs
const getMarkerColor = (location) => {
  const programs = location.programs || [];

  // Check if all programs are full
  const allFull = programs.every(p =>
    (p.capacity_actual_bed && p.occupied_beds >= p.capacity_actual_bed) ||
    (p.capacity_actual_room && p.occupied_rooms >= p.capacity_actual_room)
  );
  if (allFull) return "#ff4d4f"; // red

  // Pick first non-null sector
  const sector = programs.find(p => p.sector)?.sector?.toLowerCase() || "";

  if (sector.includes("families")) return "#2ecc71";
  if (sector.includes("men") && !sector.includes("women")) return "#3498db";
  if (sector.includes("women")) return "#e91e63";
  if (sector.includes("mixed adult")) return "#f39c12";
  if (sector.includes("youth")) return "#9b59b6";
  return "#95a5a6"; // default gray
};

  // Filter locations and programs
const filteredShelters = useMemo(() => {
  return shelters
    .map(location => {
      if (!location.latitude || !location.longitude) return null; // skip invalid coords

      const filteredPrograms = location.programs.filter(p => {
        const fullCapacity = (p.capacity_actual_bed && p.occupied_beds >= p.capacity_actual_bed) ||
                             (p.capacity_actual_room && p.occupied_rooms >= p.capacity_actual_room);
        if (!showFullCapacity && fullCapacity) return false;
        if (filters.sector && p.sector !== filters.sector) return false;
        return true;
      });

      if (!filteredPrograms.length) return null;
      if (filters.city && location.city !== filters.city) return null;

      let distance = null;
      if (userLocation) distance = getDistanceKm(userLocation.latitude, userLocation.longitude, location.latitude, location.longitude);

      return { ...location, programs: filteredPrograms, distance };
    })
    .filter(Boolean)
    .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
}, [shelters, filters, showFullCapacity, userLocation]);

  const mapCenter = userLocation ? [userLocation.latitude, userLocation.longitude] : [43.6532, -79.3832];

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
        <button className="full-capacity-button" onClick={() => setShowFullCapacity(prev => !prev)}>
          {showFullCapacity ? "Hide Full Capacity" : "Show Full Capacity"}
        </button>
      </div>

      <div className="shelters-map-count">
        Showing {filteredShelters.reduce((acc, loc) => acc + loc.programs.length, 0)} programs across {filteredShelters.length} locations
      </div>

      <MapContainer center={mapCenter} zoom={12} style={{ height: "500px", width: "100%", borderRadius: "8px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <RecenterOnUser userLocation={userLocation} />

        {userLocation && (
          <CircleMarker
            center={[userLocation.latitude, userLocation.longitude]}
            radius={8}
            color="#0000ff"
            fillColor="#0000ff"
            fillOpacity={0.5}
          />
        )}

        {filteredShelters.map(s => (
          <Marker key={s.location_name + s.address} position={[s.latitude, s.longitude]} icon={createMarkerIcon(getMarkerColor(s))}>
<Popup>
  <strong>{s.location_name}</strong><br/>
  {s.address && <a href={getGoogleMapsLink(s)}>{s.address}, {s.city}</a>}<br/>
  {s.distance !== null && (
  <span>Distance: {s.distance.toFixed(1)} km<br/></span>
)}
  {s.programs.map(p => (
    <div key={p.id}>
      {p.program_name && <span>Program: {p.program_name}<br/></span>}
      {p.capacity_actual_bed && <span>Beds: {p.occupied_beds || 0} / {p.capacity_actual_bed}<br/></span>}
      {p.capacity_actual_room && <span>Rooms: {p.occupied_rooms || 0} / {p.capacity_actual_room}<br/></span>}
    </div>
  ))}
</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SheltersMap;