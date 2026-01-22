import { createContext, useContext, useEffect, useState } from "react";
import api from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    api.setToken(token);
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    persistAuth(res.data);
    return res.data;
  };

  const register = async (payload) => {
    const res = await api.post("/auth/register", payload);
    persistAuth(res.data);
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    api.setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const persistAuth = (data) => {
    setUser(data.user);
    setToken(data.token);
    api.setToken(data.token);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
