import React, { createContext, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Register user
  const handleRegister = async (name, username, password) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/register',
        {
          name,
          username,
          password,
        }
      );

      return response.data.message || 'Registration successful';
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Login user
  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/login',
        {
          username,
          password,
        }
      );

      const { token, user } = response.data;

      if (token) {
        localStorage.setItem('token', token);
      }

      if (user) {
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        handleRegister,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};