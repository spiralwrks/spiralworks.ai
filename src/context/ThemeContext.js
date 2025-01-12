import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme-preference');
  if (savedTheme) return savedTheme;
  // Always default to light theme instead of checking system preference
  return 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme-preference', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};