import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = authService.getCurrentUser();
    setUser(current);
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success) setUser(res.data);
    return res;
  }, []);

  const signup = useCallback(async (payload) => {
    const res = await authService.signup(payload);
    if (res.success) setUser(res.data);
    return res;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updatePreferences = useCallback(async (prefs) => {
    const res = await authService.updateUserPreferences(prefs);
    if (res.success) setUser(res.data);
    return res;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, updatePreferences }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
