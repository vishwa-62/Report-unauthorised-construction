import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Sync token with axios headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      
      // Fetch profile to verify token validity
      axios.get('/auth/profile')
        .then(res => {
          setUser(res.data);
        })
        .catch(err => {
          console.error('Session expired or invalid token:', err);
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // Sync theme with DOM
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', { email, password });
      const tokenVal = res.data.token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenVal}`;
      localStorage.setItem('token', tokenVal);
      setToken(tokenVal);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      throw err.response?.data?.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (email, password, full_name, phone_number) => {
    try {
      const res = await axios.post('/auth/register', { email, password, full_name, phone_number });
      return res.data; // contains user, token, simulatedOTP
    } catch (err) {
      throw err.response?.data?.message || 'Registration failed';
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, theme, login, registerUser, logout, toggleTheme, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
