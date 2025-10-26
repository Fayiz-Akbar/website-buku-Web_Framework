// File: frontend/src/api/axios.js

import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Instance tanpa token (untuk login, register, dll)
const apiPublic = axios.create({ baseURL });

// Instance dengan token (untuk endpoint terproteksi)
const apiAuth = axios.create({ baseURL });

export const setAuthToken = (token) => {
  if (token) {
    apiAuth.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiAuth.defaults.headers.common.Authorization;
  }
};

// Export keduanya untuk kompatibilitas
export { apiPublic, apiAuth };

// Default export → banyak file impor "api" default
export default apiAuth;