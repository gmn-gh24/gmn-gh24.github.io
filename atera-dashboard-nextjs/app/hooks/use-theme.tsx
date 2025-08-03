'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { secureStorage } from '../lib/secure-storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps): React.JSX.Element {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load theme from storage on mount
    const savedTheme = secureStorage.getTheme() as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Update actual theme based on theme setting
    const updateActualTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setActualTheme(systemTheme);
      } else {
        setActualTheme(theme);
      }
    };

    updateActualTheme();

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateActualTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    
    return () => {}; // Ensure all code paths return a value
  }, [theme]);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(actualTheme);
    
    // Update CSS custom properties
    if (actualTheme === 'dark') {
      root.style.setProperty('--color-background', '#0f172a');
      root.style.setProperty('--color-foreground', '#f8fafc');
      root.style.setProperty('--color-muted', '#1e293b');
      root.style.setProperty('--color-muted-foreground', '#94a3b8');
      root.style.setProperty('--color-border', '#334155');
    } else {
      root.style.setProperty('--color-background', '#f8fafc');
      root.style.setProperty('--color-foreground', '#0f172a');
      root.style.setProperty('--color-muted', '#f1f5f9');
      root.style.setProperty('--color-muted-foreground', '#64748b');
      root.style.setProperty('--color-border', '#e2e8f0');
    }
  }, [actualTheme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    secureStorage.setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
