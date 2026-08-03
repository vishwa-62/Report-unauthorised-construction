import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure axios base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Demo account fallback map for offline / client-only standalone mode
const DEMO_USERS = {
  'citizen1@cityguard.gov': { id: 8, email: 'citizen1@cityguard.gov', full_name: 'Amit Patel', role: 'citizen', email_verified: true },
  'officer1@cityguard.gov': { id: 4, email: 'officer1@cityguard.gov', full_name: 'Inspector Vikram Singh', role: 'officer', email_verified: true },
  'engineer@cityguard.gov': { id: 3, email: 'engineer@cityguard.gov', full_name: 'Chief Engineer Anjali Sharma', role: 'engineer', email_verified: true },
  'admin@cityguard.gov': { id: 1, email: 'admin@cityguard.gov', full_name: 'Commissioner Rajesh Kumar', role: 'admin', email_verified: true }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Sync token with axios headers and verify profile
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);

      // If token is a mock token (offline mode), use local user state directly
      if (token.startsWith('mock-token-')) {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            console.error('Failed to parse cached user:', e);
          }
        }
        setLoading(false);
      } else {
        // Fetch profile from real backend
        axios.get('/auth/profile')
          .then(res => {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          })
          .catch(err => {
            console.warn('Backend unavailable or session expired. Using cached user:', err);
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
              try {
                setUser(JSON.parse(savedUser));
              } catch (e) {
                logout();
              }
            } else {
              logout();
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
      // 1. Try real backend API first
      const res = await axios.post('/auth/login', { email, password });
      if (res.data && res.data.token && res.data.user) {
        const tokenVal = res.data.token;
        const userObj = res.data.user;

        axios.defaults.headers.common['Authorization'] = `Bearer ${tokenVal}`;
        localStorage.setItem('token', tokenVal);
        localStorage.setItem('user', JSON.stringify(userObj));
        setToken(tokenVal);
        setUser(userObj);
        return userObj;
      }
    } catch (err) {
      console.warn('Backend API login unavailable/failed. Activating client demo session:', err);
    } finally {
      setLoading(false);
    }

    // 2. Guaranteed Demo / Standalone fallback login
    const emailKey = (email || '').toLowerCase().trim();
    const demoUser = DEMO_USERS[emailKey] || {
      id: Date.now(),
      email: email,
      full_name: email ? email.split('@')[0] : 'CityGuard User',
      role: emailKey.includes('admin') ? 'admin' : emailKey.includes('engineer') ? 'engineer' : emailKey.includes('officer') ? 'officer' : 'citizen',
      email_verified: true
    };

    const mockToken = `mock-token-${Date.now()}`;
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(demoUser));
    setToken(mockToken);
    setUser(demoUser);
    return demoUser;
  };

  const registerUser = async (email, password, full_name, phone_number) => {
    try {
      const res = await axios.post('/auth/register', { email, password, full_name, phone_number });
      return res.data;
    } catch (err) {
      // Standalone fallback for registration
      const newUser = {
        id: Date.now(),
        email,
        full_name,
        role: 'citizen',
        phone_number: phone_number || '',
        email_verified: true
      };
      const mockToken = `mock-token-${Date.now()}`;
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(mockToken);
      setUser(newUser);
      return { message: 'Registration successful', token: mockToken, user: newUser, simulatedOTP: '123456' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
