import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, ScanLine, History, User, LogOut, X, Leaf, ChevronRight, Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ThemeToggle } from '../common/ThemeToggle.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', icon: Home,     label: 'Overview' },
  { to: '/scan',      icon: ScanLine, label: 'Scan product' },
  { to: '/history',   icon: History,  label: 'Scan history' },
  { to: '/profile',   icon: User,     label: 'My profile' },
];

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); onClose?.(); };
  const initials = (user?.name || 'U').split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        aria-label="Sidebar navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[260px] flex-col sidebar-transition lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--ls-sidebar)', borderRight: '1px solid var(--ls-border)' }}
      >
        {/* Brand */}
        <div className="flex h-[68px] shrink-0 items-center justify-between px-5" style={{ borderBottom: '1px solid var(--ls-border)' }}>
          <button type="button" onClick={() => { navigate('/dashboard'); onClose?.(); }} className="group flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl ls-brand-gradient shadow-sm transition-transform group-hover:scale-105">
              <Leaf size={18} className="text-white" strokeWidth={2} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[16px] font-bold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', color: 'var(--ls-heading)' }}>FoodLens</span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] mt-0.5" style={{ color: 'var(--ls-gold)' }}>Food Intelligence</span>
            </span>
          </button>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 transition-colors lg:hidden" style={{ color: 'var(--ls-muted)' }} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--ls-subtle)' }}>Navigation</p>
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${isActive ? '' : 'hover:bg-[var(--ls-green-soft)]'}`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? 'var(--ls-green-light)' : 'transparent',
                    color: isActive ? 'var(--ls-green)' : 'var(--ls-muted)',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full" style={{ background: 'var(--ls-green)' }} />}
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all"
                        style={{
                          background: isActive ? 'var(--ls-green)' : 'var(--ls-green-soft)',
                          color: isActive ? '#FFFFFF' : 'var(--ls-green)',
                          boxShadow: isActive ? '0 2px 6px rgba(34,113,74,0.25)' : 'none',
                        }}>
                        <Icon size={15} strokeWidth={2} />
                      </span>
                      <span style={{ fontWeight: isActive ? 600 : 500 }}>{label}</span>
                      {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="mt-5 overflow-hidden rounded-2xl p-4" style={{ background: 'linear-gradient(135deg,#142F20 0%,#22714A 100%)' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <Zap size={12} className="text-yellow-300" />
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">Quick scan</span>
            </div>
            <p className="text-xs leading-5 text-white/55 mb-3">Scan any food label for instant AI insights.</p>
            <button type="button" onClick={() => { navigate('/scan'); onClose?.(); }}
              className="flex w-full items-center justify-between rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/25 border border-white/15">
              Start scanning
              <ChevronRight size={13} />
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="shrink-0 px-3 py-3 space-y-2" style={{ borderTop: '1px solid var(--ls-border)' }}>
          <button type="button" onClick={() => { navigate('/profile'); onClose?.(); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--ls-green-soft)]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: 'var(--ls-green-light)', color: 'var(--ls-green)', border: '1.5px solid var(--ls-border)' }}>
              {initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold" style={{ color: 'var(--ls-heading)' }}>{user?.name || 'User'}</span>
              <span className="mt-0.5 block truncate text-[11px]" style={{ color: 'var(--ls-muted)' }}>{user?.email || ''}</span>
            </span>
            <ChevronRight size={14} style={{ color: 'var(--ls-subtle)', flexShrink: 0 }} />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center justify-between rounded-xl border px-3 py-2"
              style={{ background: 'var(--ls-surface)', borderColor: 'var(--ls-border)' }}>
              <span className="text-xs font-medium" style={{ color: 'var(--ls-muted)' }}>Theme</span>
              <ThemeToggle />
            </div>
            <button id="sidebar-logout-btn" type="button" onClick={handleLogout}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all hover:opacity-80"
              style={{ color: 'var(--ls-red)', background: 'var(--ls-red-light)', borderColor: 'var(--ls-border)' }}
              aria-label="Sign out">
              <LogOut size={16} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
