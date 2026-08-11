import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const TOKEN_KEY = 'sasyavedha_token';
const USER_KEY = 'sasyavedha_user';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verify any existing session token against the backend on mount.
    const verify = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsAuthenticated(true);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        } else {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      } catch (error) {
        console.error('Session verification failed:', error);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem(TOKEN_KEY, data.session_token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { success: true };
      }

      return { success: false, error: data.message || 'Login failed' };
    } catch (error) {
      return { success: false, error: 'Could not reach the server. Please try again.' };
    }
  };

  const signup = async (username, email, password) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem(TOKEN_KEY, data.session_token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { success: true };
      }

      return { success: false, error: data.message || 'Signup failed' };
    } catch (error) {
      return { success: false, error: 'Could not reach the server. Please try again.' };
    }
  };

  const logout = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    }
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
