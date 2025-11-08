import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Check if user is logged in on mount
    const storedAuth = localStorage.getItem('isLoggedIn');
    const storedEmail = localStorage.getItem('userEmail');
    
    if (storedAuth === 'true' && storedEmail) {
      setIsAuthenticated(true);
      setUserEmail(storedEmail);
    }
  }, []);

  const login = (email, remember) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    if (remember) {
      localStorage.setItem('rememberMe', 'true');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberMe');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

