import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = ApiClient.getToken();
    if (!token) {
      setIsInitialLoading(false);
      return;
    }

    try {
      const response = await ApiClient.get('/auth/me');
      if (response.success && response.data.user) {
        setUser(response.data.user);
      } else {
        ApiClient.setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('Session expired or invalid:', err.message);
      ApiClient.setToken(null);
      setUser(null);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await ApiClient.post('/auth/login', { email, password });
      if (response.requiresOtp) {
        return {
          success: true,
          requiresOtp: true,
          email: response.data?.email || email,
          debugOtp: response.debugOtp || response.data?.debugOtp,
          message: response.message,
        };
      }
      if (response.success && response.data) {
        ApiClient.setToken(response.data.token);
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      setError(err.message || 'Authentication failed');
      return { success: false, error: err.message || 'Authentication failed' };
    }
  };

  const verifyOtp = async (email, otp) => {
    setError(null);
    try {
      const response = await ApiClient.post('/auth/verify-otp', { email, otp });
      if (response.success && response.data) {
        ApiClient.setToken(response.data.token);
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      throw new Error(response.message || 'OTP verification failed');
    } catch (err) {
      setError(err.message || 'OTP verification failed');
      return { success: false, error: err.message || 'OTP verification failed' };
    }
  };

  const resendOtp = async (email) => {
    try {
      const response = await ApiClient.post('/auth/resend-otp', { email });
      return {
        success: true,
        debugOtp: response.debugOtp || response.data?.debugOtp,
        message: response.message,
      };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to resend OTP' };
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const response = await ApiClient.post('/auth/register', { name, email, password });
      if (response.requiresOtp) {
        return {
          success: true,
          requiresOtp: true,
          email: response.data?.email || email,
          debugOtp: response.debugOtp || response.data?.debugOtp,
          message: response.message,
        };
      }
      return response;
    } catch (err) {
      setError(err.message || 'Registration failed');
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await ApiClient.post('/auth/logout');
    } catch (err) {
      console.warn('Logout error ignored:', err.message);
    } finally {
      ApiClient.setToken(null);
      setUser(null);
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    return user.permissions?.includes(permission);
  };

  const isAdmin = user?.role === 'ADMIN' || user?.isUser === 'admin';
  const isCustomer = !isAdmin;
  const isUser = isCustomer;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isInitialLoading,
        error,
        isAuthenticated: !!user,
        isUser,
        isCustomer,
        isAdmin,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        hasPermission,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      isUser: true,
      isCustomer: true,
      isAdmin: false,
      login: async () => ({ success: false, error: 'Auth context not available' }),
      register: async () => ({ success: false, error: 'Auth context not available' }),
      verifyOtp: async () => ({ success: false, error: 'Auth context not available' }),
      resendOtp: async () => ({ success: false, error: 'Auth context not available' }),
      logout: async () => {},
      hasPermission: () => false,
      checkAuth: async () => {},
    };
  }
  return context;
};
