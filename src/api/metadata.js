import axios from "axios";
const API_BASE = "https://shelter-server-n9v6.onrender.com";
export const getSheltersMetadata = async () => {
  try {
    const res = await axios.get(`${API_BASE}/shelters/metadata`);
    return res.data;
  } catch (err) {
    console.error("Error fetching shelters metadata:", err);
    return { lastRefreshed: null };
  }
};