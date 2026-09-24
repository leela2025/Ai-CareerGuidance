import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('career_compass_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('career_compass_token'));
  const [loading, setLoading] = useState(true);

  // Fetch current user and profile on mount if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
          setProfile(response.data.profile);
          localStorage.setItem('career_compass_user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        console.error('Failed to authenticate stored session token:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const { token: receivedToken, user: receivedUser } = response.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('career_compass_token', receivedToken);
      localStorage.setItem('career_compass_user', JSON.stringify(receivedUser));

      // Fetch profile right after login
      try {
        const profRes = await api.get('/profile');
        if (profRes.data.success) {
          setProfile(profRes.data.profile);
        }
      } catch (e) {
        // Ignored, user will complete onboarding
      }
      return response.data;
    }
    return response.data;
  };

  const register = async (name, email, password, role = 'student') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    if (response.data.success) {
      const { token: receivedToken, user: receivedUser } = response.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('career_compass_token', receivedToken);
      localStorage.setItem('career_compass_user', JSON.stringify(receivedUser));
      return response.data;
    }
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('career_compass_token');
    localStorage.removeItem('career_compass_user');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/profile');
      if (res.data.success) {
        setProfile(res.data.profile);
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  const updateProfileState = (newProfile) => {
    setProfile(newProfile);
  };

  const value = {
    user,
    profile,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshProfile,
    updateProfileState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
