import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthAPI } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shringar_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('shringar_token') || null;
  });

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const setAuthSession = (authData) => {
    const userInfo = {
      id: authData.userId || authData.id,
      firstName: authData.firstName,
      lastName: authData.lastName,
      email: authData.email,
      phone: authData.phone,
      role: authData.role,
    };
    setUser(userInfo);
    setToken(authData.token);
    localStorage.setItem('shringar_token', authData.token);
    localStorage.setItem('shringar_user', JSON.stringify(userInfo));
  };

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const data = await AuthAPI.login(identifier, password);
      setAuthSession(data);
      toast.success(`Welcome back, ${data.firstName}! 🌸`);
      return data;
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const data = await AuthAPI.signup(userData);
      setAuthSession(data);
      toast.success(`Welcome to Shringar, ${data.firstName}! ✨`);
      return data;
    } catch (err) {
      toast.error(err.message || 'Signup failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('shringar_token');
    localStorage.removeItem('shringar_user');
    toast.info('You have been logged out.');
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
