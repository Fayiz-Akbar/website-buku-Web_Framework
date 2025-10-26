// Di dalam file AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import { apiAuth, apiPublic, setAuthToken } from "../api/axios"; // ganti dari 'axios'

export const AuthContext = createContext(null); // sediakan named export juga

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      apiAuth
        .get("/user")
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          setAuthToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  // --- FUNGSI LOGIN YANG DIPERBAIKI ---
  const login = async (email, password) => {
    try {
      // pastikan tidak ada token lama saat login
      setAuthToken(null);
      const res = await apiPublic.post("/login", { email, password });

      if (res.data?.token && res.data?.user) {
        const { token: apiToken, user: apiUser } = res.data;
        setToken(apiToken);
        setUser(apiUser);
        localStorage.setItem("token", apiToken);
        setAuthToken(apiToken);
        return apiUser;
      }
      throw new Error("Respons login tidak valid.");
    } catch (err) {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setAuthToken(null);
      throw err;
    }
  };
  // --- BATAS PERBAIKAN ---

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    setAuthToken(null);
  };

  // Memperbarui informasi user di context setelah update profil
  const updateUser = (updatedUser) => {
    // Terima baik objek user lengkap dari server maupun partial
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, token, login, logout, updateUser, isLoggedIn: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
