// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ScanLine, Search, Edit, BarChart3,
  XCircle, AlertTriangle, CheckCircle, Clock,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { historyService } from '../services/historyService.js';
import { userService } from '../services/userService.js';
import { StatCard } from '../components/common/Card.jsx';
import { VerdictBadge } from '../components/common/Badge.jsx';
import { InlineLoader } from '../components/common/Spinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(isoString));
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      userService.getProfile(),
      historyService.getStats(),
      historyService.getHistory({ page: 1, limit: 5 }),
    ])
      .then(([prof, st, hist]) => {
        setProfile(prof);
        setStats(st);
        setRecentScans(hist.scans || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/library?search=${encodeURIComponent(search)}`);
  };

  const firstName = profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'there';

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--ls-text)' }}>
          Hello, {firstName} 👋
        </h1>
        <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>What will you scan today?</p>
      </div>

      {/* Search + Scan row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ls-muted)' }} />
          <input
            id="dashboard-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product or ingredient…"
            className="ls-input pl-9 pr-4"
            aria-label="Search"
          />
        </form>
        <Link
          to="/scan"
          id="dashboard-scan-cta"
          className="ls-btn ls-btn-primary px-6 gap-2 flex-shrink-0 animate-pulse-green"
        >
          <ScanLine size={18} />
          Scan a Barcode
        </Link>
      </div>

      {loading ? (
        <InlineLoader message="Loading your dashboard…" />
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: main content */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Stats */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ls-muted)' }}>
                Your scan stats
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  icon={BarChart3}
                  label="Total Scans"
                  value={stats?.totalScans ?? 0}
                  colorClass="bg-[var(--ls-green-light)] text-[var(--ls-green)]"
                />
                <StatCard
                  icon={XCircle}
                  label="Avoid"
                  value={stats?.avoid ?? stats?.avoidCount ?? 0}
                  colorClass="bg-[var(--ls-red-light)] text-[var(--ls-red)]"
                />
                <StatCard
                  icon={AlertTriangle}
                  label="Caution"
                  value={stats?.caution ?? stats?.cautionCount ?? 0}
                  colorClass="bg-[var(--ls-amber-light)] text-[var(--ls-amber)]"
                />
                <StatCard
                  icon={CheckCircle}
                  label="OK"
                  value={stats?.ok ?? stats?.okCount ?? 0}
                  colorClass="bg-[var(--ls-green-light)] text-[var(--ls-green)]"
                />
              </div>
            </div>

            {/* Recent scans */}
            <div className="ls-surface" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid var(--ls-border)' }}
              >
                <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--ls-text)' }}>
                  <Clock size={18} style={{ color: 'var(--ls-green)' }} />
                  Recent Scans
                </div>
                <Link to="/history" className="text-sm font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--ls-green)' }}>
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              {recentScans.length === 0 ? (
                <EmptyState
                  icon={ScanLine}
                  title="No scans yet"
                  description="Your scan history will appear here."
                  action={
                    <Link to="/scan" className="ls-btn ls-btn-primary text-sm px-4 py-2">
                      Scan your first product
                    </Link>
                  }
                />
              ) : (
                <ul>
                  {recentScans.map((scan, idx) => (
                    <li
                      key={scan._id}
                      className={`flex items-center justify-between px-5 py-3.5 hover:bg-[var(--ls-bg)] transition-colors ${
                        idx < recentScans.length - 1 ? 'border-b border-[var(--ls-border)]' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--ls-text)' }}>
                          {scan.productName}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--ls-muted)' }}>
                          {scan.brand} · {formatDate(scan.scannedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                        <VerdictBadge verdict={scan.verdict} />
                        <Link
                          to={`/result/${scan._id}`}
                          className="text-xs font-medium hover:underline flex-shrink-0"
                          style={{ color: 'var(--ls-green)' }}
                        >
                          View
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right: health profile summary */}
          <div className="flex flex-col gap-4">
            <div className="ls-surface p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold" style={{ color: 'var(--ls-text)' }}>Health Profile</h2>
                <Link
                  to="/profile"
                  id="dashboard-edit-profile-btn"
                  className="flex items-center gap-1 text-xs font-medium hover:underline"
                  style={{ color: 'var(--ls-green)' }}
                >
                  <Edit size={12} /> Edit
                </Link>
              </div>

              {profile ? (
                <div className="flex flex-col gap-4">
                  {/* Allergies */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--ls-muted)' }}>
                      Allergies
                    </p>
                    {profile.allergies?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {profile.allergies.map((a) => (
                          <span key={a} className="ls-badge verdict-bg-avoid">{a}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs" style={{ color: 'var(--ls-muted)' }}>None</p>
                    )}
                  </div>

                  {/* Conditions */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--ls-muted)' }}>
                      Health Conditions
                    </p>
                    {profile.healthConditions?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {profile.healthConditions.map((c) => (
                          <span key={c} className="ls-badge verdict-bg-caution">{c}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs" style={{ color: 'var(--ls-muted)' }}>None</p>
                    )}
                  </div>

                  {/* Diet */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--ls-muted)' }}>
                      Diet
                    </p>
                    <span className="ls-badge verdict-bg-ok">
                      {profile.dietPreference || 'Not set'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm mb-3" style={{ color: 'var(--ls-muted)' }}>
                    Set up your health profile to get personalised scan results.
                  </p>
                  <Link to="/setup" className="ls-btn ls-btn-secondary text-sm px-4 py-2">
                    Set Up Profile
                  </Link>
                </div>
              )}
            </div>

            {/* Quick scan card */}
            <Link
              to="/scan"
              id="dashboard-quick-scan-card"
              className="ls-brand-gradient rounded-xl p-5 flex flex-col gap-3 ls-card-hover"
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <ScanLine size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">Quick Scan</p>
                <p className="text-sm text-white/70">Scan a barcode or upload an ingredient image</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-white/80 font-medium">
                Start scanning <ArrowRight size={14} />
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
