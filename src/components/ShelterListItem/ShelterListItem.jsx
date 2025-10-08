import React from "react";
import ProgramListItem from "../ProgramListItem/ProgramListItem";
import './ShelterListItem.scss'

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const ShelterListItem = ({ loc, userLocation, getGoogleMapsLink }) => {
const fullCapacity = loc.programs.every(
  p =>
    ((p.capacity_actual_bed ?? 0) <= (p.occupied_beds ?? 0)) &&
    ((p.capacity_actual_room ?? 0) <= (p.occupied_rooms ?? 0))
);

  const distance =
    userLocation && loc.latitude && loc.longitude
      ? getDistanceKm(userLocation.latitude, userLocation.longitude, loc.latitude, loc.longitude)
      : null;

  return (
    <li className={`shelter-item ${fullCapacity ? "full-capacity" : ""}`}>
      <div className="shelter-header">
        <h3 className="shelter-name">{loc.location_name}</h3>
        {fullCapacity && <span className="full-badge">FULL</span>}
      </div>

      {loc.address && loc.city && (
        <p className="shelter-address">
          <strong>Address:</strong>{" "}
          <a href={getGoogleMapsLink(loc)} target="_blank" rel="noopener noreferrer">
            {loc.address}, {loc.city}, {loc.province}
          </a>
        </p>
      )}
      
      <a href="tel:4163384766" className="disclaimer-link">
              Call Toronto Central Intake
            </a>{" "}

      {distance && (
        <p className="shelter-distance">
          <strong>Distance:</strong> {distance.toFixed(1)} km
        </p>
      )}
        
      <ul className="program-list">
        {loc.programs.map(p => (
          <ProgramListItem key={p.id} program={p} />
        ))}
      </ul>

      {loc.address && loc.city && (
        <div className="map-container">
          <iframe
            width="100%"
            height="200"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              `${loc.address}, ${loc.city}, ${loc.province || ""}`
            )}&z=15&output=embed`}
          ></iframe>
        </div>
      )}
    </li>
  );
};

export default ShelterListItem;