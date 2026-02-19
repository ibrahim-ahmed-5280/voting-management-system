import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    try {
      const { data } = await api.get("/api/auth/status");
      setUser(data.authenticated ? data.user : null);
    } catch (_error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const adminLogin = async (payload) => {
    const { data } = await api.post("/api/auth/admin/login", payload);
    setUser(data.user);
    return data;
  };

  const voterLogin = async (payload) => {
    const { data } = await api.post("/api/auth/voter/login", payload);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await api.post("/api/auth/logout");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      checkStatus,
      adminLogin,
      voterLogin,
      logout
    }),
    [user, loading, checkStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

