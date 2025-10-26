// File: frontend/src/api/axios.js

import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api"; // fallback aman

const apiAuth = axios.create({ baseURL });
const apiPublic = axios.create({ baseURL });

export const setAuthToken = (token) => {
  if (token) apiAuth.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete apiAuth.defaults.headers.common.Authorization;
};

export { apiPublic, apiAuth };
export default apiAuth;