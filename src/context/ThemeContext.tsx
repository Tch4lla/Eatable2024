import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, IThemeContextType } from '@/types';

const ThemeContext = createContext<IThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Check if theme is stored in localStorage, default to dark if not
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'dark';
  });

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Update localStorage and document class when theme changes
  useEffect(() => {
    localStorage.setItem('theme', theme);

    // Apply theme class to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
