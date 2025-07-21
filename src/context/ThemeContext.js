import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

const getInitialTheme = () => {
  // Always return dark theme
  return 'dark';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    // Always set dark theme
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};