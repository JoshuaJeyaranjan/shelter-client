import axios from "axios";

const API_BASE = "https://shelter-server-n9v6.onrender.com";

export const getShelters = async (filters = {}) => {
  try {
    const params = {};
    if (filters.sector) params.sector = filters.sector;
    if (filters.city) params.city = filters.city;
    if (filters.minVacancyBeds) params.minVacancyBeds = filters.minVacancyBeds;
    if (filters.minVacancyRooms) params.minVacancyRooms = filters.minVacancyRooms;

    const res = await axios.get(`${API_BASE}/shelters`, { params });

    return {
      shelters: Array.isArray(res.data) ? res.data : res.data.shelters || [],
      metadata: res.data.metadata || {},
    };
  } catch (err) {
    console.error("Error fetching shelters:", err);
    return { shelters: [], metadata: {} };
  }
};;