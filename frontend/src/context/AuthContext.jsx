import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('realcred_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('realcred_token'));
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const initAuth = async () => {
      const existingToken = localStorage.getItem('realcred_token');
      if (existingToken) {
        try {
          const res = await authService.getMe();
          if (res?.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('realcred_user', JSON.stringify(res.data.user));
          }
        } catch {
          // Token invalid or expired
          setUser(null);
          setToken(null);
          localStorage.removeItem('realcred_token');
          localStorage.removeItem('realcred_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async ({ emailOrPhone, password, role }) => {
    const response = await authService.login({
      emailOrPhone,
      password,
      role: role || selectedRole,
    });

    const { user: userData, token: jwtToken, redirectPath } = response.data;
    setUser(userData);
    setToken(jwtToken);
    setSelectedRole(null);
    localStorage.setItem('realcred_token', jwtToken);
    localStorage.setItem('realcred_user', JSON.stringify(userData));

    return { user: userData, redirectPath };
  };

  const registerPartner = async (formData) => {
    const response = await authService.registerPartner(formData);
    if (response?.data?.token) {
      const { user: userData, token: jwtToken } = response.data;
      setUser(userData);
      setToken(jwtToken);
      setSelectedRole(null);
      localStorage.setItem('realcred_token', jwtToken);
      localStorage.setItem('realcred_user', JSON.stringify(userData));
    }
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
      setToken(null);
      setSelectedRole(null);
      localStorage.removeItem('realcred_token');
      localStorage.removeItem('realcred_user');
    }
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading,
    selectedRole,
    setSelectedRole,
    login,
    registerPartner,
    logout,
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

export default AuthContext;
