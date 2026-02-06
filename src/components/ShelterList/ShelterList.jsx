import React, { useState, useEffect, useMemo } from "react";
import { getLocations } from "../../api/shelters";
import ShelterListItem from "../ShelterListItem/ShelterListItem";
import "./ShelterList.scss";
import { filterSheltersWithOccupancy } from "../../utils/filterSheltersWithOccupancy";



const ShelterList = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    sector: "",
    city: "",
    minVacancyBeds: "",
    minVacancyRooms: "",
  });

  const [allSectors, setAllSectors] = useState([]);
  const [allCities, setAllCities] = useState([]);

  const [showFullCapacity, setShowFullCapacity] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // --- Google Maps link helper ---
  const getGoogleMapsLink = (loc) => {
    if (!loc.address || !loc.city) return "#";
    const query = encodeURIComponent(
      `${loc.address}, ${loc.city}, ${loc.province || ""}`
    );
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  // --- User geolocation (one-time) ---
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => console.warn("Geolocation denied/unavailable:", err)
    );
  }, []);

  // --- Fetch shelters from API ---
  const fetchLocations = async () => {
    setLoading(true);

    try {
      const locationsArray = await getLocations(filters);

      if (!Array.isArray(locationsArray)) {
        setLocations([]);
        return;
      }

      const normalized = locationsArray
        .map((loc) => {
          const latitude = Number(loc.latitude);
          const longitude = Number(loc.longitude);

          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            console.warn(
              "Dropping location due to invalid coordinates:",
              loc.location_name,
              loc.latitude,
              loc.longitude
            );
            return null;
          }

          const programs =
            loc.programs?.filter(
              (p) => p.program_name && p.sector
            ) || [];

          if (!loc.address || programs.length === 0) {
            return null;
          }

          return {
            ...loc,
            latitude,
            longitude,
            programs,
          };
        })
        .filter(Boolean);

      setLocations(normalized);

      // Optional: populate filter dropdowns
      setAllSectors(
        [...new Set(normalized.flatMap((l) => l.programs.map((p) => p.sector)))]
          .sort()
      );
      setAllCities(
        [...new Set(normalized.map((l) => l.city).filter(Boolean))].sort()
      );
    } catch (err) {
      console.error("Error fetching shelters:", err);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when filters change
  useEffect(() => {
    fetchLocations();
  }, [filters]);

  // --- Apply occupancy + distance + filters ---
  const visibleLocations = useMemo(() => {
    return filterSheltersWithOccupancy({
      locations,
      showFullCapacity,
      filters,
      userLocation,
    });
  }, [locations, filters, showFullCapacity, userLocation]);

  // --- Filter handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // --- Render ---
  return (
    <div className="shelter-list-container">
      <h1>Toronto Shelters</h1>

      <div className="filters">
        <select name="sector" value={filters.sector} onChange={handleFilterChange}>
          <option value="">All Sectors</option>
          {allSectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select name="city" value={filters.city} onChange={handleFilterChange}>
          <option value="">All Cities</option>
          {allCities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
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
      </div>

      <div style={{ margin: "1rem 0" }}>
        <button
          className="full-capacity-button"
          onClick={() => setShowFullCapacity((v) => !v)}
        >
          {showFullCapacity
            ? "Hide Full Capacity Locations"
            : "Show Full Capacity Locations"}
        </button>
      </div>

      <div className="shelters-map-count">
        Showing{" "}
        {visibleLocations.reduce(
          (acc, loc) => acc + loc.programs.length,
          0
        )}{" "}
        programs across {visibleLocations.length} locations
      </div>

      {loading ? (
        <p>Loading shelters...</p>
      ) : visibleLocations.length === 0 ? (
        <p>No shelters found.</p>
      ) : (
        <ul className="shelter-list">
          {visibleLocations.map((loc) => (
            <ShelterListItem
              key={`${loc.id}`}
              loc={loc}
              userLocation={userLocation}
              getGoogleMapsLink={getGoogleMapsLink}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ShelterList;