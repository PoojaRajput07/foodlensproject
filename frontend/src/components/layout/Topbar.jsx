// src/components/layout/Topbar.jsx
import { Menu, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Topbar({ onMenuClick, title }) {
  const navigate = useNavigate();
  return (
    <header
      className="lg:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-20"
      style={{
        background: 'var(--ls-surface)',
        borderBottom: '1px solid var(--ls-border)',
      }}
    >
      <button
        onClick={onMenuClick}
        className="p-1.5 rounded-lg"
        style={{ color: 'var(--ls-muted)' }}
        aria-label="Open menu"
        id="topbar-menu-btn"
      >
        <Menu size={22} />
      </button>
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 font-bold"
        style={{ color: 'var(--ls-green)' }}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center ls-brand-gradient">
          <Leaf size={14} className="text-white" />
        </div>
        {title || 'Label Sach'}
      </button>
    </header>
  );
}
