import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = process.env.API_BASE ?? "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// attach token if available
api.interceptors.request.use((cfg) => {
  const token = Cookies.get("mediconsult_token");
  if (token && cfg.headers) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
