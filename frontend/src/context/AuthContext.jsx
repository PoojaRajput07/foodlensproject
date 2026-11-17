// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ls-user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('ls-token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getMe()
      .then((u) => {
        setUser(u);
        localStorage.setItem('ls-user', JSON.stringify(u));
      })
      .catch(() => {
        localStorage.removeItem('ls-token');
        localStorage.removeItem('ls-user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Listen for 401 from axios interceptor
  useEffect(() => {
    const handler = () => {
      setUser(null);
      navigate('/login', { replace: true });
    };
    window.addEventListener('ls:unauthorized', handler);
    return () => window.removeEventListener('ls:unauthorized', handler);
  }, [navigate]);

  const login = useCallback(async (credentials) => {
    const { token, user: u } = await authService.login(credentials);
    localStorage.setItem('ls-token', token);
    localStorage.setItem('ls-user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (payload) => {
    const { token, user: u } = await authService.register(payload);
    localStorage.setItem('ls-token', token);
    localStorage.setItem('ls-user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    // Call backend to clear refresh token cookie
    try { await authService.logout(); } catch { /* ignore */ }
    localStorage.removeItem('ls-token');
    localStorage.removeItem('ls-user');
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('ls-user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
