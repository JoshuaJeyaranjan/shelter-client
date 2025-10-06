import axios from "axios";

const API_BASE = "https://shelter-server-n9v6.onrender.com/locations";

// Fetch all locations with optional filters
export const getLocations = async (filters = {}) => {
  try {
    const params = {};
    if (filters.sector) params.sector = filters.sector;
    if (filters.city) params.city = filters.city;
    if (filters.minVacancyBeds) params.minVacancyBeds = filters.minVacancyBeds;
    if (filters.minVacancyRooms) params.minVacancyRooms = filters.minVacancyRooms;

    const res = await axios.get(`${API_BASE}/`, { params });

    // Ensure API response has an array
    if (!res.data || !Array.isArray(res.data.locations)) {
      console.error("Unexpected API response:", res.data);
      return [];
    }

    // Filter out any locations without an address just in case
    return res.data.locations.filter(loc => loc.address && loc.programs?.length > 0);
  } catch (err) {
    console.error("Error fetching locations:", err);
    return [];
  }
};

// Fetch a single location by ID
export const getLocationById = async (id) => {
  try {
    const res = await axios.get(`${API_BASE}/${id}/location`);
    return res.data;
  } catch (err) {
    console.error(`Error fetching location ${id}:`, err);
    return null;
  }
};

// Fetch occupancy info for a location
export const getLocationOccupancy = async (id) => {
  try {
    const res = await axios.get(`${API_BASE}/${id}/occupancy`);
    return res.data;
  } catch (err) {
    console.error(`Error fetching occupancy for location ${id}:`, err);
    return null;
  }
};

// Fetch locations for map display (lat/lng + basic info)
export const getLocationsForMap = async () => {
  try {
    const res = await axios.get(`${API_BASE}/map`);
    if (!res.data || !Array.isArray(res.data)) {
      console.error("Unexpected API response for map:", res.data);
      return [];
    }
    return res.data.filter(loc => loc.address); // again, filter out missing addresses
  } catch (err) {
    console.error("Error fetching locations for map:", err);
    return [];
  }
}