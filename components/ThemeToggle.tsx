
import React from 'react';
import { Theme } from '../types';
import { Icon } from './Icon';

interface ThemeToggleProps {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-white focus:outline-none transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Icon name="sun" /> : <Icon name="moon" />}
    </button>
  );
};
