import React from "react";
import "./ShelterFilters.scss";

const ShelterFilters = ({
  filters,
  setFilters,
  allSectors,
  allCities,
  allShelterTypes,
  allOrganizations,
  showFullCapacity,
  setShowFullCapacity,
}) => {
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === "number" ? Math.max(0, Number(value)) : value;
    setFilters((prev) => ({ ...prev, [name]: val }));
  };

  const handleClear = () => {
    setFilters({
      sector: "",
      city: "",
      shelterType: "",
      organization: "",
      minVacancyBeds: "",
      minVacancyRooms: "",
    });
    setShowFullCapacity(false);
  };

  return (
    <div className="filters">
      
      <select name="sector" value={filters.sector} onChange={handleChange}>
        <option value="">All Sectors</option>
        {allSectors.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      
      <select name="city" value={filters.city} onChange={handleChange}>
        <option value="">All Cities</option>
        {allCities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      
      <select
        name="shelterType"
        value={filters.shelterType}
        onChange={handleChange}
      >
        <option value="">All Shelter Types</option>
        {allShelterTypes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      
      <select
        name="organization"
        value={filters.organization}
        onChange={handleChange}
        className="organization-select"
      >
        <option value="">All Organizations</option>
        {allOrganizations.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>

      
      <input
        className="number-input"
        type="number"
        name="minVacancyBeds"
        placeholder="Min Beds"
        min={0}
        value={filters.minVacancyBeds}
        onChange={handleChange}
      />

      
      <input
        className="number-input"
        type="number"
        name="minVacancyRooms"
        placeholder="Min Rooms"
        min={0}
        value={filters.minVacancyRooms}
        onChange={handleChange}
      />
      
      <button
        type="button"
        className="clear-filters-button"
        onClick={handleClear}
      >
        Clear Filters
      </button>

      <button
        type="button"
        className="full-capacity-button"
        onClick={() => setShowFullCapacity((v) => !v)}
      >
        {showFullCapacity ? "Hide Full Capacity" : "Show Full Capacity"}
      </button>
    </div>
  );
};

export default ShelterFilters;
