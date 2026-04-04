import { useState, useCallback } from "react";
import { login as apiLogin } from "../api/auth";

export function useAuth() {
  const stored = localStorage.getItem("user");
  const [user, setUser] = useState(stored ? JSON.parse(stored) : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError("");
    try {
      const data = await apiLogin(username, password);
      localStorage.setItem("token", data.access_token);
      const userObj = { username: data.username, full_name: data.full_name };
      localStorage.setItem("user", JSON.stringify(userObj));
      setUser(userObj);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return { user, login, logout, loading, error };
}
