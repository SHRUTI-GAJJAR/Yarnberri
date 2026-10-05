import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const token = localStorage.getItem('yarnberri_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        setUser(response.user || null);
      } catch (error) {
        localStorage.removeItem('yarnberri_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const login = async (credentials) => {
    const response = await authService.loginUser(credentials);
    localStorage.setItem('yarnberri_token', response.token);
    setUser(response.user);
    return response.user;
  };

  const register = async (payload) => {
    const response = await authService.registerUser(payload);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem('yarnberri_token');
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((currentUser) => (currentUser ? { ...currentUser, ...updates } : currentUser));
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: Boolean(user),
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
}
