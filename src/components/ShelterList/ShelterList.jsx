import React, { useState, useEffect } from "react";
import { getLocations } from "../../api/shelters";
import { getLocationsMetadata } from "../../api/metadata";
import ShelterListItem from "../ShelterListItem/ShelterListItem";
import "./ShelterList.scss";

// Haversine formula
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
  const [metadata, setMetadata] = useState({ lastRefreshed: null });
  const [userLocation, setUserLocation] = useState(null);

  // 🗺️ Google Maps link
  const getGoogleMapsLink = (location) => {
    if (!location.address || !location.city) return "#";
    const query = encodeURIComponent(
      `${location.address}, ${location.city}, ${location.province || ""}`
    );
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  // 📍 Get user geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => console.warn("Geolocation not available or denied:", err)
    );
  }, []);

  // 🧾 Fetch metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const meta = await getLocationsMetadata();
        if (meta?.lastRefreshed) {
          const torontoTime = new Date(meta.lastRefreshed).toLocaleString("en-CA", {
            timeZone: "America/Toronto",
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          setMetadata({ lastRefreshed: torontoTime });
        }
      } catch (err) {
        console.error("Error fetching metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  // 🏠 Fetch shelter locations
  const fetchLocations = async () => {
    setLoading(true);
    try {
      const locationsArray = await getLocations(filters);

      if (!Array.isArray(locationsArray)) {
        console.error("Unexpected API response:", locationsArray);
        setLocations([]);
        return;
      }

      // STEP 1: Filter invalid data
      const validLocations = locationsArray
        .filter((loc) => loc.address && loc.programs?.length)
        .map((loc) => ({
          ...loc,
          programs: loc.programs.filter((p) => p.program_name && p.sector),
        }))
        .filter((loc) => loc.programs.length > 0);

const now = new Date();
const RECENT_HOURS = 24; // newly updated
const FRESH_HOURS = 72;  // still fresh
const MAX_HIDE_HOURS = 24 * 30; // hide if older than 30 days

const freshnessFiltered = validLocations
  .map(loc => {
    let recentPrograms = [];
    let freshPrograms = [];
    let stalePrograms = [];

    loc.programs.forEach(p => {
      if (!p.occupancy_date) return;

      const occupancyTime = new Date(p.occupancy_date);
      if (isNaN(occupancyTime)) return;

      const hoursOld = (now - occupancyTime) / (1000 * 60 * 60);

      if (hoursOld <= RECENT_HOURS) {
        p.freshness = "recent";  // 🔥 updated within 24h
        recentPrograms.push(p);
      } else if (hoursOld <= FRESH_HOURS) {
        p.freshness = "fresh";   // ✅ updated within 72h
        freshPrograms.push(p);
      } else if (hoursOld <= MAX_HIDE_HOURS) {
        p.freshness = "stale";   // ⚠️ updated more than 72h ago
        stalePrograms.push(p);
      }
      // else ignore programs >30 days old
    });

    // Keep only locations that have at least one program in any category
    const allPrograms = [...recentPrograms, ...freshPrograms, ...stalePrograms];
    if (allPrograms.length === 0) return null;

    // Optional: flag if all programs are stale
    const staleData = recentPrograms.length + freshPrograms.length === 0;

    return { ...loc, programs: allPrograms, staleData };
  })
  .filter(Boolean);

      // STEP 2: Add distance
      const withDistance = userLocation
        ? freshnessFiltered.map((loc) => ({
            ...loc,
            distance:
              loc.latitude && loc.longitude
                ? getDistanceKm(
                    userLocation.latitude,
                    userLocation.longitude,
                    loc.latitude,
                    loc.longitude
                  )
                : null,
          }))
        : freshnessFiltered;

      // STEP 3: Extract unique filter options
      if (!allSectors.length) {
        const sectorsSet = new Set();
        withDistance.forEach((loc) => loc.programs.forEach((p) => sectorsSet.add(p.sector)));
        setAllSectors(Array.from(sectorsSet).sort());
      }

      if (!allCities.length) {
        const citiesSet = new Set(withDistance.map((loc) => loc.city).filter(Boolean));
        setAllCities(Array.from(citiesSet).sort());
      }

      setLocations(withDistance);
    } catch (err) {
      console.error("Error fetching shelters:", err);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch on user location change or filter apply
  useEffect(() => {
    fetchLocations();
  }, [userLocation]);

  // 🎛️ Filter locations for display
  const visibleLocations = locations.filter((loc) => {
    if (filters.city && loc.city !== filters.city) return false;

    const filteredPrograms = loc.programs.filter((p) => {
      if (filters.sector && p.sector !== filters.sector) return false;

      const fullCapacity =
        (p.capacity_actual_bed && p.occupied_beds >= p.capacity_actual_bed) ||
        (p.capacity_actual_room && p.occupied_rooms >= p.capacity_actual_room);

      if (!showFullCapacity && fullCapacity) return false;
      return true;
    });

    return filteredPrograms.length > 0;
  });

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => fetchLocations();

  // 🧩 RENDER
  return (
    <div className="shelter-list-container">
      <h1>Toronto Shelters</h1>

      {/* Filters */}
      <div className="filters">
        <select name="sector" value={filters.sector} onChange={handleFilterChange}>
          <option value="">All Sectors</option>
          {allSectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select name="city" value={filters.city} onChange={handleFilterChange}>
          <option value="">All Cities</option>
          {allCities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
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
        <button onClick={applyFilters}>Search</button>
      </div>

      {/* Toggle full capacity */}
      <div style={{ margin: "1rem 0" }}>
        <button
          className="full-capacity-button"
          onClick={() => setShowFullCapacity(!showFullCapacity)}
        >
          {showFullCapacity
            ? "Hide Full Capacity Locations"
            : "Show Full Capacity Locations"}
        </button>
      </div>

      {/* Metadata */}
      {metadata?.lastRefreshed && (
        <div className="last-refreshed">Last Refreshed: {metadata.lastRefreshed}</div>
      )}

      {/* Info summary */}
      <div className="shelter-list-info">
        Showing {visibleLocations.length} of {locations.length} active locations
      </div>

      {/* Shelter List */}
      {loading ? (
        <p>Loading shelters...</p>
      ) : visibleLocations.length === 0 ? (
        <p>No shelters found.</p>
      ) : (
        <ul className="shelter-list">
          {visibleLocations.map((loc) => (
            <ShelterListItem
              key={`${loc.location_name}-${loc.address}`}
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