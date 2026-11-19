import { Menu, Leaf, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../common/ThemeToggle.jsx';

export function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  return (
    <header
      className="lg:hidden sticky top-0 z-20 flex items-center justify-between gap-3 px-4 h-14"
      style={{
        background: 'var(--ls-surface)',
        borderBottom: '1px solid var(--ls-border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:opacity-80"
        style={{ color: 'var(--ls-text)', background: 'var(--ls-green-soft)' }}
        aria-label="Open menu"
        id="topbar-menu-btn"
      >
        <Menu size={19} />
      </button>

      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 font-bold text-base"
        style={{ color: 'var(--ls-heading)', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg ls-brand-gradient">
          <Leaf size={14} className="text-white" />
        </span>
        FoodLens
      </button>

      <ThemeToggle />
    </header>
  );
}
