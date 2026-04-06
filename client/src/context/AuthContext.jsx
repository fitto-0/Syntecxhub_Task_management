import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { authService } from "../services/api.js";

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
    setLoading(false);
  }, [token]);

  const persistAuth = useCallback((authData) => {
    // authData is the { token, user } object from res.data
    setUser(authData.user);
    setToken(authData.token);
    localStorage.setItem("token", authData.token);
    localStorage.setItem("user", JSON.stringify(authData.user));
  }, []);

  const login = useCallback(async (email, password) => {
    const authData = await authService.login({ email, password });
    persistAuth(authData);
    return authData;
  }, [persistAuth]);

  const register = useCallback(async (payload) => {
    const authData = await authService.register(payload);
    persistAuth(authData);
    return authData;
  }, [persistAuth]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser
  }), [user, token, loading, login, register, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
