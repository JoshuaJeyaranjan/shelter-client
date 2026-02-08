import React, { useState, useEffect, useMemo } from "react";
import { getLocations } from "../../api/shelters";
import ShelterListItem from "../ShelterListItem/ShelterListItem";
import ShelterFilters from "../ShelterFilters/ShelterFilters";
import "./ShelterList.scss";
import { filterSheltersWithOccupancy } from "../../utils/filterSheltersWithOccupancy";
import Spinner from "../Spinner/Spinner";
const ShelterList = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    sector: "",
    city: "",
    shelterType: "",
    organization: "",
    minVacancyBeds: "",
    minVacancyRooms: "",
  });

  const [allSectors, setAllSectors] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [allShelterTypes, setAllShelterTypes] = useState([]);
  const [allOrganizations, setAllOrganizations] = useState([]);

  const [showFullCapacity, setShowFullCapacity] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  
  const getGoogleMapsLink = (loc) =>
    loc.address && loc.city
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${loc.address}, ${loc.city}, ${loc.province || ""}`,
        )}`
      : "#";

  
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => console.warn("Geolocation unavailable:", err),
    );
  }, []);

  
  const fetchLocations = async () => {
    setLoading(true);
    try {
      const locationsArray = await getLocations(); 

      if (!Array.isArray(locationsArray)) {
        setLocations([]);
        return;
      }

      const normalized = locationsArray
        .map((loc) => {
          const latitude = Number(loc.latitude);
          const longitude = Number(loc.longitude);
          if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
            return null;

          const programs =
            loc.programs?.filter((p) => p.program_name && p.sector) || [];
          if (!loc.address || programs.length === 0) return null;

          return { ...loc, latitude, longitude, programs };
        })
        .filter(Boolean);

      setLocations(normalized);

      
      setAllSectors(
        [
          ...new Set(
            normalized.flatMap((l) => l.programs.map((p) => p.sector)),
          ),
        ].sort(),
      );
      setAllCities(
        [...new Set(normalized.map((l) => l.city).filter(Boolean))].sort(),
      );
      setAllShelterTypes([
        ...new Set(normalized.map((l) => l.shelter_type).filter(Boolean)),
      ]);
      setAllOrganizations([
        ...new Set(normalized.map((l) => l.organization_name).filter(Boolean)),
      ]);
    } catch (err) {
      console.error("Error fetching shelters:", err);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  
  const visibleLocations = useMemo(() => {
    return filterSheltersWithOccupancy({
      locations,
      showFullCapacity,
      filters,
      userLocation,
    }).filter((loc) => {
      if (filters.shelterType && loc.shelter_type !== filters.shelterType)
        return false;
      if (
        filters.organization &&
        loc.organization_name !== filters.organization
      )
        return false;
      return true;
    });
  }, [locations, filters, showFullCapacity, userLocation]);



  return (
    <div className="shelter-list-container">
      <ShelterFilters
        filters={filters}
        setFilters={setFilters}
        allSectors={allSectors}
        allCities={allCities}
        allShelterTypes={allShelterTypes}
        allOrganizations={allOrganizations}
        showFullCapacity={showFullCapacity}
        setShowFullCapacity={setShowFullCapacity}
      />

      <div className="shelters-map-count">
        <span className="highlight-program-number">
          {visibleLocations.reduce((acc, s) => acc + s.programs.length, 0)}
        </span>{" "}
        programs across{" "}
        <span className="highlight-location-number">
          {visibleLocations.length}
        </span>{" "}
        locations
      </div>

      {loading ? (
        <Spinner size={80} color="#1e90ff" text="Loading shelters..." />
      ) : visibleLocations.length === 0 ? (
        <p>No shelters found.</p>
      ) : (
        <ul className="shelter-list">
          {visibleLocations.map((loc) => (
            <ShelterListItem
              key={loc.id}
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
