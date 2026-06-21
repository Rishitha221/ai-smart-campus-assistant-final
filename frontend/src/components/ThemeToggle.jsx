import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all duration-200 focus:outline-none"
      title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {darkMode ? (
        <Sun className="h-5 w-5 text-amber-500 animate-pulse-slow" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
