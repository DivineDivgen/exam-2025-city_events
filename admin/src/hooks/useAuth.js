import { useEffect, useState, useCallback } from "react";

const STORAGE_USER = "admin_user";
const STORAGE_TOKEN = "admin_token";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost/api";

export function useAuth() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_USER);
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN) || "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_USER);
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem(STORAGE_TOKEN, token);
    else localStorage.removeItem(STORAGE_TOKEN);
  }, [token]);

  const headers = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

  const login = useCallback(async (email, password) => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.message || "Login failed");
      }
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      setMessage("Prisijungta");
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, name, adminCode) => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role: adminCode ? "ADMIN" : "USER", adminCode }),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.message || "Registracija nepavyko");
      }
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      setMessage("Registracija sėkminga");
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken("");
    setMessage("Atsijungta");
  }, []);

  return {
    user,
    token,
    headers,
    error,
    message,
    loading,
    login,
    register,
    logout,
    API_BASE,
  };
}

export default useAuth;
