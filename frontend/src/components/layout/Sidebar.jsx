// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, ScanLine, History, BookOpen, User,
  LogOut, X, Leaf,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ThemeToggle } from '../common/ThemeToggle.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', icon: Home,     label: 'Home' },
  { to: '/scan',      icon: ScanLine, label: 'Scan' },
  { to: '/history',   icon: History,  label: 'History' },
  { to: '/library',   icon: BookOpen, label: 'Library' },
  { to: '/profile',   icon: User,     label: 'Profile' },
];

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 sidebar-overlay lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 flex flex-col
          sidebar-transition
          lg:static lg:translate-x-0 lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'var(--ls-surface)', borderRight: '1px solid var(--ls-border)' }}
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--ls-border)' }}
        >
          <button
            onClick={() => { navigate('/dashboard'); onClose?.(); }}
            className="flex items-center gap-2 font-bold text-lg"
            style={{ color: 'var(--ls-green)' }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center ls-brand-gradient"
            >
              <Leaf size={16} className="text-white" />
            </div>
            Label Sach
          </button>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg"
            style={{ color: 'var(--ls-muted)' }}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Main navigation">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-white ls-brand-gradient'
                        : 'hover:bg-[var(--ls-bg)]'
                    }`
                  }
                  style={({ isActive }) =>
                    isActive ? {} : { color: 'var(--ls-text)' }
                  }
                  aria-current={undefined}
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer: user + theme + logout */}
        <div
          className="p-4 flex flex-col gap-3"
          style={{ borderTop: '1px solid var(--ls-border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: 'var(--ls-green-light)', color: 'var(--ls-green)' }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--ls-text)' }}>
                {user?.name || 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--ls-muted)' }}>
                {user?.email || ''}
              </p>
            </div>
            <ThemeToggle />
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium w-full transition-colors hover:opacity-80"
            style={{ color: 'var(--ls-red)', background: 'var(--ls-red-light)' }}
            id="sidebar-logout-btn"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
