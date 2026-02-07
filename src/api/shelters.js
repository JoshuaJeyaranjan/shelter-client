import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://shelter-server-n9v6.onrender.com/locations";

/**
 * Generic GET helper to reduce repetition
 */
const apiGet = async (path = "", params = {}) => {
  try {
    const res = await axios.get(`${API_BASE}${path}`, { params });
    return res.data;
  } catch (err) {
    console.error(`Error fetching ${path}:`, err);
    return null;
  }
};

/**
 * Fetch all locations with optional filters
 */
export const getLocations = async (filters = {}) => {
  const data = await apiGet("/", filters);
  const locations = data?.locations ?? [];
  return locations.filter((loc) => loc.address && loc.programs?.length > 0);
};

/**
 * Fetch a single location by ID
 */
export const getLocationById = async (id) => {
  if (!id) return null;
  return (await apiGet(`/${id}`)) ?? null;
};

/**
 * Fetch occupancy info for a location
 */
export const getLocationOccupancy = async (id) => {
  if (!id) return null;
  return (await apiGet(`/${id}/occupancy`)) ?? null;
};

/**
 * Fetch locations with lat/lng info for map
 */
export const getLocationsForMap = async () => {
  const locations = (await apiGet("/map")) ?? [];
  return Array.isArray(locations) ? locations.filter((loc) => loc.address) : [];
};
