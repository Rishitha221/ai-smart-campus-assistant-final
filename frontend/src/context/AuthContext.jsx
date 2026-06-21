import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate current token by fetching profile
    const validateToken = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            // Token invalid or expired
            logout();
          }
        } catch (error) {
          console.error("Token validation error:", error);
        }
      }
      setLoading(false);
    };

    validateToken();
  }, [token]);

  const login = async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (username, email, password, fullName, department, role = 'student') => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password, full_name: fullName, department, role })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfile = async (fullName, department, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ full_name: fullName, department, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Profile update failed');
    }

    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  };

  // Helper utility to make authenticated API requests
  const apiCall = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (res.status === 401) {
      logout();
      throw new Error('Session expired. Please log in again.');
    }

    // Handle file download/blob returns (like PDF and Excel)
    const contentType = res.headers.get('content-type');
    if (contentType && (contentType.includes('pdf') || contentType.includes('sheet') || contentType.includes('excel'))) {
      if (!res.ok) {
        throw new Error('File download failed');
      }
      return res.blob();
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, updateProfile, apiCall }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
