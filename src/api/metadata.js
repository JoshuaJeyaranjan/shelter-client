import axios from "axios";

const API_BASE = "https://shelter-server-n9v6.onrender.com/locations";

// Fetch metadata
export const getLocationsMetadata = async () => {
  try {
    const res = await axios.get(`${API_BASE}/metadata`);
    return res.data;
  } catch (err) {
    console.error("Error fetching locations metadata:", err);
    return { lastRefreshed: null };
  }
};
