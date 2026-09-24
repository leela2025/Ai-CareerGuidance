import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('career_compass_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      try {
        localStorage.removeItem('career_compass_user');
      } catch (_) {}
      return null;
    }
  });

  const [profile, setProfile] = useState(null);

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('career_compass_token') || null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Fetch current user and profile on mount if token exists
  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (isMounted && response.data.success) {
          setUser(response.data.user);
          setProfile(response.data.profile);
          try {
            localStorage.setItem(
              'career_compass_user',
              JSON.stringify(response.data.user)
            );
          } catch (_) {}
        }
      } catch (err) {
        console.warn('Failed to verify current session token:', err.message);
        // Only invalidate stored session if the backend explicitly returns 401 Unauthorized
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    if (response.data.success) {
      const { token: receivedToken, user: receivedUser } = response.data;
      setToken(receivedToken);
      setUser(receivedUser);

      try {
        localStorage.setItem('career_compass_token', receivedToken);
        localStorage.setItem('career_compass_user', JSON.stringify(receivedUser));
      } catch (_) {}

      // Fetch profile right after login
      try {
        const profRes = await api.get('/profile');
        if (profRes.data.success) {
          setProfile(profRes.data.profile);
        }
      } catch (e) {
        // Non-fatal, user will complete onboarding
      }

      return response.data;
    }
    return response.data;
  };

  const register = async (name, email, password, role = 'student') => {
    const response = await api.post('/auth/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
    });

    if (response.data.success) {
      const {
        token: receivedToken,
        user: receivedUser,
        profile: receivedProfile,
      } = response.data;

      setToken(receivedToken);
      setUser(receivedUser);
      if (receivedProfile) {
        setProfile(receivedProfile);
      }

      try {
        localStorage.setItem('career_compass_token', receivedToken);
        localStorage.setItem('career_compass_user', JSON.stringify(receivedUser));
      } catch (_) {}

      return response.data;
    }
    return response.data;
  };

  const logout = () => {
    try {
      localStorage.removeItem('career_compass_token');
      localStorage.removeItem('career_compass_user');
    } catch (_) {}

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
