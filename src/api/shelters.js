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

    // Ensure API response has a locations array
    if (!res.data || !Array.isArray(res.data.locations)) {
      console.error("Unexpected API response:", res.data);
      return [];
    }

    return res.data.locations; // return array directly
  } catch (err) {
    console.error("Error fetching shelters:", err);
    return [];
  }
};;