import React, { useState, useMemo, useEffect } from "react";
import ShelterFilters from "../ShelterFilters/ShelterFilters";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "./SheltersMap.scss";
import { filterSheltersWithOccupancy } from "../../utils/filterSheltersWithOccupancy";

const SECTOR_COLORS = {
  families: "#2ecc71",
  men: "#3498db",
  women: "#e91e63",
  "mixed adult": "#f39c12",
  youth: "#8e44ad",
  default: "#95a5a6",
};
const MULTI_SECTOR_COLOR = "#ffa2c4";
const FULL_CAPACITY_COLOR = "#7f8c8d";

const getProgramColor = (program) => {
  const sectors = program.sector?.split(",").map((s) => s.trim().toLowerCase()) || [];
  if (sectors.length > 1) return MULTI_SECTOR_COLOR;
  return SECTOR_COLORS[sectors[0]] || SECTOR_COLORS.default;
};

const createMarkerIcon = (color) =>
  L.divIcon({
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

const RecenterOnUser = ({ userLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.latitude, userLocation.longitude], 13, { duration: 1.5 });
    }
  }, [userLocation]);
  return null;
};

const getMarkerColor = (location) => {
  const programs = location.programs || [];
  const allFull = programs.every(
    (p) =>
      (p.capacity_actual_bed && p.occupied_beds >= p.capacity_actual_bed) ||
      (p.capacity_actual_room && p.occupied_rooms >= p.capacity_actual_room)
  );
  if (allFull) return FULL_CAPACITY_COLOR;

  const sectors = Array.from(new Set(programs.map((p) => p.sector).filter(Boolean)));
  if (sectors.length > 1) return MULTI_SECTOR_COLOR;
  if (!sectors.length) return SECTOR_COLORS.default;

  return SECTOR_COLORS[sectors[0].toLowerCase()] || SECTOR_COLORS.default;
};

const SheltersMap = ({ shelters }) => {
  const [filters, setFilters] = useState({
    sector: "",
    city: "",
    shelterType: "",
    organization: "",
    minVacancyBeds: "",
    minVacancyRooms: "",
  });

  const [showFullCapacity, setShowFullCapacity] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => console.warn("Geolocation unavailable:", err)
    );
  }, []);

  // Flatten for filter dropdowns
  const allPrograms = useMemo(() => shelters.flatMap((s) => s.programs), [shelters]);
  const sectors = useMemo(
    () => Array.from(new Set(allPrograms.map((p) => p.sector).filter(Boolean))).sort(),
    [allPrograms]
  );
  const cities = useMemo(
    () => Array.from(new Set(shelters.map((s) => s.city).filter(Boolean))).sort(),
    [shelters]
  );
  const shelterTypes = useMemo(
    () => Array.from(new Set(shelters.map((s) => s.shelter_type).filter(Boolean))),
    [shelters]
  );
  const organizations = useMemo(
    () => Array.from(new Set(shelters.map((s) => s.organization_name).filter(Boolean))),
    [shelters]
  );

  // Filter shelters
  const filteredShelters = useMemo(() => {
    return filterSheltersWithOccupancy({ locations: shelters, showFullCapacity, filters, userLocation })
      .filter((s) => {
        if (filters.shelterType && s.shelter_type !== filters.shelterType) return false;
        if (filters.organization && s.organization_name !== filters.organization) return false;
        return true;
      });
  }, [shelters, filters, showFullCapacity, userLocation]);

  const mapCenter = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [43.6532, -79.3832];

  const getGoogleMapsLink = (shelter) =>
    shelter.address && shelter.city
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${shelter.address}, ${shelter.city}, ${shelter.province || ""}`
        )}`
      : "#";

  return (
    <div className="shelters-map-container">
      {/* Filters */}
      <ShelterFilters
        filters={filters}
        setFilters={setFilters}
        allSectors={sectors}
        allCities={cities}
        allShelterTypes={shelterTypes}
        allOrganizations={organizations}
        showFullCapacity={showFullCapacity}
        setShowFullCapacity={setShowFullCapacity}
      />

      <div className="shelters-map-count">
        Showing {filteredShelters.reduce((acc, s) => acc + s.programs.length, 0)} programs across {filteredShelters.length} locations
      </div>

      {/* Map */}
      <MapContainer center={mapCenter} zoom={12} style={{ height: "500px", width: "100%", borderRadius: "8px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <RecenterOnUser userLocation={userLocation} />

        {userLocation && (
          <CircleMarker center={[userLocation.latitude, userLocation.longitude]} radius={8} color="#0000ff" fillColor="#0000ff" fillOpacity={0.5} />
        )}

        {filteredShelters.map((s) => (
          <Marker key={s.id} position={[s.latitude, s.longitude]} icon={createMarkerIcon(getMarkerColor(s))}>
            <Popup>
              <div className="popup-container">
                <strong>{s.location_name}</strong>
                {s.shelter_type && <span> • {s.shelter_type} Shelter</span>}
                {s.address && (
                  <p>
                    <a href={getGoogleMapsLink(s)} target="_blank" rel="noopener noreferrer">
                      {s.address}, {s.city}
                    </a>
                  </p>
                )}
                {s.programs.map((p) => (
                  <div key={p.id} style={{ borderLeft: `4px solid ${getProgramColor(p)}`, paddingLeft: "4px", marginBottom: "0.5rem" }}>
                    <strong>{p.program_name}</strong>
                    {p.capacity_actual_bed > 0 && <div>Beds: {p.occupied_beds}/{p.capacity_actual_bed}</div>}
                    {p.capacity_actual_room > 0 && <div>Rooms: {p.occupied_rooms}/{p.capacity_actual_room}</div>}
                  </div>
                ))}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="map-legend">
        <ul>
          {Object.entries(SECTOR_COLORS).map(([sector, color]) =>
            sector !== "default" && (
              <li key={sector}>
                <span className="legend-color" style={{ backgroundColor: color }}></span>
                {sector.charAt(0).toUpperCase() + sector.slice(1)}
              </li>
            )
          )}
          <li>
            <span className="legend-color" style={{ backgroundColor: MULTI_SECTOR_COLOR }}></span>
            Multiple Sectors
          </li>
          <li>
            <span className="legend-color" style={{ backgroundColor: FULL_CAPACITY_COLOR }}></span>
            Full Capacity
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SheltersMap;