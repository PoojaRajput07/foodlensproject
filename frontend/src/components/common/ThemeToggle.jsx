// src/components/common/ThemeToggle.jsx
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export function ThemeToggle({ className = '' }) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${className}`}
      style={{
        background: 'var(--ls-green-light)',
        color: 'var(--ls-green)',
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
