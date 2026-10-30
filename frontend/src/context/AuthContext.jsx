import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await authService.getMe();
          if (res?.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (error) {
          // If token verification fails, keep stored user if present for offline preview
          const saved = localStorage.getItem('user');
          if (saved) {
            setUser(JSON.parse(saved));
          } else {
            authService.logout();
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      const { access_token, refresh_token, user: loggedUser } = res.data;
      localStorage.setItem('access_token', access_token);
      if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      toast.success(`Welcome back, ${loggedUser.name}!`);
      return loggedUser;
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (donorData) => {
    setIsLoading(true);
    try {
      const res = await authService.register(donorData);
      toast.success(res.message || 'Registration successful! You may now log in.');
      return res;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please check your information.';
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (profileData) => {
    try {
      const res = await authService.updateProfile(profileData);
      const updated = res.data || { ...user, ...profileData };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Profile updated successfully!');
      return updated;
    } catch (error) {
      toast.error('Failed to update profile.');
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Successfully logged out.');
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    updateUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
