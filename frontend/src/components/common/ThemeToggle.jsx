
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export function ThemeToggle({ className = '' }) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className={`
        group relative flex h-10 w-10 shrink-0 items-center justify-center
        overflow-hidden rounded-xl border
        transition-all duration-300 ease-out
        focus:outline-none focus-visible:ring-2
        focus-visible:ring-[#A9C8AE]
        focus-visible:ring-offset-2
        ${className}
      `}
      style={{
        background: isDark ? '#263B31' : '#EAF3EB',
        color: isDark ? '#D8C9A5' : '#286E49',
        borderColor: isDark ? '#3B5145' : '#D6E5D8',
        boxShadow: isDark
          ? '0 2px 8px rgba(0,0,0,0.16)'
          : '0 2px 8px rgba(30,70,45,0.05)',
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isDark
            ? 'rgba(216,201,165,0.08)'
            : 'rgba(36,122,80,0.07)',
        }}
      />

      <span className="relative transition-transform duration-300 group-hover:rotate-12 group-active:scale-90">
        {isDark ? (
          <Sun size={18} strokeWidth={1.8} />
        ) : (
          <Moon size={18} strokeWidth={1.8} />
        )}
      </span>
    </button>
  );
}
