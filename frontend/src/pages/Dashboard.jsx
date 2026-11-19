
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ScanLine, Search, Pencil, BarChart3, ShieldAlert, AlertTriangle,
  CircleCheck, Clock3, ArrowUpRight, Leaf, Activity, ChevronRight,
  Sparkles, UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { historyService } from '../services/historyService.js';
import { userService } from '../services/userService.js';
import { VerdictBadge } from '../components/common/Badge.jsx';
import { InlineLoader } from '../components/common/Spinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(date);
}

const TONE_STYLES = {
  green: { background: 'var(--ls-green-light)', color: 'var(--ls-green)' },
  red:   { background: 'var(--ls-red-light)',   color: 'var(--ls-red)' },
  amber: { background: 'var(--ls-amber-light)', color: 'var(--ls-amber)' },
  sage:  { background: 'var(--ls-neutral-light)',color: 'var(--ls-neutral)' },
};

function StatCard({ label, value, icon: Icon, tone }) {
  const toneStyle = TONE_STYLES[tone] || TONE_STYLES.green;
  return (
    <div
      className="rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:-translate-y-1 cursor-default"
      style={{
        background: 'var(--ls-surface)',
        borderColor: 'var(--ls-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl"
          style={toneStyle}
        >
          <Icon size={18} strokeWidth={1.8} />
        </div>
        <ArrowUpRight size={14} style={{ color: 'var(--ls-subtle)' }} />
      </div>
      <p
        className="text-xl sm:text-2xl font-bold tracking-tight"
        style={{ color: 'var(--ls-heading)', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
      >
        {value}
      </p>
      <p className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--ls-muted)' }}>{label}</p>
    </div>
  );
}

function ProfileTag({ children, tone = 'green' }) {
  const styles = {
    green: { background: 'var(--ls-green-light)', color: 'var(--ls-green)', borderColor: 'var(--ls-border)' },
    amber: { background: 'var(--ls-amber-light)', color: 'var(--ls-amber)', borderColor: 'var(--ls-border)' },
    red:   { background: 'var(--ls-red-light)',   color: 'var(--ls-red)',   borderColor: 'var(--ls-border)' },
  };
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold"
      style={styles[tone]}
    >
      {children}
    </span>
  );
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
    let active = true;
    Promise.all([
      userService.getProfile(),
      historyService.getStats(),
      historyService.getHistory({ page: 1, limit: 5 }),
    ])
      .then(([prof, st, hist]) => {
        if (!active) return;
        setProfile(prof);
        setStats(st);
        setRecentScans(hist?.scans || []);
      })
      .catch((err) => console.error('Dashboard data loading failed:', err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/library?search=${encodeURIComponent(search.trim())}`);
  };

  const firstName = profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'there';
  const healthProfile = profile?.healthProfile || profile;
  const allergies = healthProfile?.allergies || [];
  const conditions = healthProfile?.conditions || profile?.healthConditions || [];
  const diet = healthProfile?.diet || profile?.dietPreference || 'Not set';

  return (
    <div className="w-full space-y-5 sm:space-y-6 pb-10 animate-fade-in" style={{ color: 'var(--ls-text)' }}>

      {/* ── Welcome Banner ── */}
      <section
        className="relative overflow-hidden rounded-2xl border p-5 sm:p-7 lg:p-8"
        style={{ background: 'var(--ls-green-soft)', borderColor: 'var(--ls-border)' }}
      >
        {/* Decorative rings */}
        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border opacity-50"
          style={{ borderColor: 'var(--ls-border-strong)' }} />
        <div className="pointer-events-none absolute -right-2 -top-8 h-36 w-36 rounded-full border opacity-50"
          style={{ borderColor: 'var(--ls-border-strong)' }} />

        <div className="relative z-10 max-w-2xl">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
            style={{ background: 'var(--ls-surface)', borderColor: 'var(--ls-border)' }}
          >
            <Leaf size={12} style={{ color: 'var(--ls-green)' }} />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--ls-green)' }}>
              Your personal food companion
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight"
            style={{ color: 'var(--ls-heading)', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
          >
            Welcome back, {firstName}.
          </h1>

          <p className="mt-2 sm:mt-3 max-w-lg text-sm sm:text-base leading-6" style={{ color: 'var(--ls-muted)' }}>
            Make informed food choices with personalized insights. Know what goes into your food before it goes into your cart.
          </p>

          <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
            <Link to="/scan" className="ls-btn ls-btn-primary gap-2 px-4 py-2.5 sm:px-5 text-sm">
              <ScanLine size={15} />
              Scan a product
              <ArrowUpRight size={13} />
            </Link>
            <Link to="/history" className="ls-btn ls-btn-ghost gap-2 px-4 py-2.5 sm:px-5 text-sm">
              View history
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Decorative leaf (desktop only) */}
        <div
          className="pointer-events-none absolute bottom-0 right-10 hidden h-44 w-44 items-center justify-center rounded-full lg:flex"
          style={{ background: 'var(--ls-green-light)', opacity: 0.6 }}
        >
          <div
            className="flex h-28 w-28 items-center justify-center rounded-full"
            style={{ background: 'var(--ls-surface)', opacity: 0.75 }}
          >
            <Leaf size={52} strokeWidth={1} style={{ color: 'var(--ls-green)' }} />
          </div>
        </div>
      </section>

      {/* ── Search ── */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-semibold" style={{ color: 'var(--ls-heading)', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
            Explore your food
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm" style={{ color: 'var(--ls-muted)' }}>
            Search products and ingredients.
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex w-full gap-2 sm:max-w-sm">
          {/* <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--ls-subtle)' }} />
            <input
              id="dashboard-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or ingredients"
              aria-label="Search products or ingredients"
              className="ls-input h-11 pl-10 text-sm"
            />
          </div> */}
          {/* <button type="submit" className="ls-btn ls-btn-secondary h-11 px-4 text-sm whitespace-nowrap">
            Search
          </button> */}
        </form>
      </section>

      {/* ── Loading ── */}
      {loading ? (
        <div className="rounded-2xl border py-16" style={{ background: 'var(--ls-surface)', borderColor: 'var(--ls-border)' }}>
          <InlineLoader message="Loading your dashboard..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-[1fr_300px]">

          {/* ── Left Column ── */}
          <div className="min-w-0 space-y-5 sm:space-y-6">

            {/* Stats */}
            <section>
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--ls-subtle)' }}>
                    Your activity
                  </p>
                  <h2 className="mt-0.5 text-lg sm:text-xl font-semibold" style={{ color: 'var(--ls-heading)', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                    Scan overview
                  </h2>
                </div>
                <span className="text-xs" style={{ color: 'var(--ls-muted)' }}>All time</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard icon={BarChart3}    label="Total scans" value={stats?.totalScans ?? 0}                           tone="green" />
                <StatCard icon={ShieldAlert}  label="Avoid"       value={stats?.avoid ?? stats?.avoidCount ?? 0}           tone="red" />
                <StatCard icon={AlertTriangle} label="Caution"    value={stats?.caution ?? stats?.cautionCount ?? 0}       tone="amber" />
                <StatCard icon={CircleCheck}  label="OK"          value={stats?.ok ?? stats?.okCount ?? 0}                 tone="sage" />
              </div>
            </section>

            {/* Recent scans */}
            <section
              className="overflow-hidden rounded-2xl border"
              style={{ background: 'var(--ls-surface)', borderColor: 'var(--ls-border)', boxShadow: 'var(--shadow-card)' }}
            >
              <div
                className="flex items-center justify-between border-b px-4 py-4 sm:px-6"
                style={{ borderColor: 'var(--ls-border)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl" style={{ background: 'var(--ls-green-light)', color: 'var(--ls-green)' }}>
                    <Clock3 size={15} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-semibold" style={{ color: 'var(--ls-heading)', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                      Recent scans
                    </h2>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--ls-muted)' }}>Your latest product analysis</p>
                  </div>
                </div>
                <Link
                  to="/history"
                  className="inline-flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: 'var(--ls-green)' }}
                >
                  View all <ArrowUpRight size={13} />
                </Link>
              </div>

              {recentScans.length === 0 ? (
                <div className="px-4 py-8 sm:px-6">
                  <EmptyState
                    icon={ScanLine}
                    title="No scans yet"
                    description="Your scanned products and their personalized analysis will appear here."
                    action={
                      <Link to="/scan" className="ls-btn ls-btn-primary gap-2 text-sm">
                        <ScanLine size={15} />
                        Scan your first product
                      </Link>
                    }
                  />
                </div>
              ) : (
                <ul>
                  {recentScans.map((scan, index) => {
                    const productName = scan.productName || scan.product?.name || 'Unnamed product';
                    const brand = scan.brand || scan.product?.brand || 'Unknown brand';
                    const verdict = scan.verdict || scan.overallVerdict || 'UNVERIFIED';
                    const scannedAt = scan.scannedAt || scan.createdAt;
                    return (
                      <li
                        key={scan._id}
                        className={`flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--ls-green-soft)] sm:px-6 ${
                          index !== recentScans.length - 1 ? 'border-b' : ''
                        }`}
                        style={{ borderColor: 'var(--ls-border)' }}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                            style={{ background: 'var(--ls-green-soft)', borderColor: 'var(--ls-border)', color: 'var(--ls-green)' }}
                          >
                            <Leaf size={16} strokeWidth={1.7} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold" style={{ color: 'var(--ls-heading)' }}>{productName}</p>
                            <p className="mt-0.5 truncate text-xs" style={{ color: 'var(--ls-muted)' }}>
                              {brand}
                              <span className="mx-1.5" style={{ color: 'var(--ls-subtle)' }}>·</span>
                              {formatDate(scannedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                          <VerdictBadge verdict={verdict} />
                          <Link
                            to={`/result/${scan._id}`}
                            aria-label={`View ${productName} analysis`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:opacity-80"
                            style={{ color: 'var(--ls-green)', background: 'var(--ls-green-soft)' }}
                          >
                            <ArrowUpRight size={15} />
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Info banner */}
            <section
              className="flex items-start gap-3 sm:gap-4 rounded-2xl border p-4 sm:p-5"
              style={{ background: 'var(--ls-green-light)', borderColor: 'var(--ls-border)' }}
            >
              <div
                className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'var(--ls-surface)', color: 'var(--ls-green)', boxShadow: 'var(--shadow-xs)' }}
              >
                <Activity size={17} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--ls-heading)' }}>
                  Better food choices start with awareness
                </h3>
                <p className="mt-1.5 text-xs leading-5" style={{ color: 'var(--ls-muted)' }}>
                  FoodLens analyzes product ingredients against your saved profile to help you understand potential concerns.
                  Always consult a qualified professional for medical advice.
                </p>
              </div>
            </section>
          </div>

          {/* ── Right Column (sidebar) ── */}
          <aside className="space-y-4 sm:space-y-5">

            {/* Health profile card */}
            <section
              className="overflow-hidden rounded-2xl border"
              style={{ background: 'var(--ls-surface)', borderColor: 'var(--ls-border)', boxShadow: 'var(--shadow-card)' }}
            >
              <div
                className="flex items-center justify-between border-b px-4 py-4 sm:px-5"
                style={{ borderColor: 'var(--ls-border)' }}
              >
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.17em]" style={{ color: 'var(--ls-subtle)' }}>
                    Personal information
                  </p>
                  <h2 className="mt-0.5 text-sm sm:text-base font-semibold" style={{ color: 'var(--ls-heading)', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                    Health profile
                  </h2>
                </div>
                <Link
                  to="/profile"
                  id="dashboard-edit-profile-btn"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-opacity hover:opacity-80"
                  style={{ background: 'var(--ls-green-light)', color: 'var(--ls-green)' }}
                  aria-label="Edit health profile"
                >
                  <Pencil size={13} />
                </Link>
              </div>

              {profile ? (
                <div className="space-y-4 p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full"
                      style={{ background: 'var(--ls-green-light)', color: 'var(--ls-green)' }}
                    >
                      <UserRound size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--ls-heading)' }}>
                        {profile.name || user?.name || 'Your profile'}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--ls-muted)' }}>Personalized food preferences</p>
                    </div>
                  </div>

                  <div className="h-px" style={{ background: 'var(--ls-border)' }} />

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--ls-muted)' }}>Allergies</h3>
                      <span className="text-[10px]" style={{ color: 'var(--ls-subtle)' }}>{allergies.length} added</span>
                    </div>
                    {allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {allergies.map((a) => <ProfileTag key={a} tone="red">{a}</ProfileTag>)}
                      </div>
                    ) : (
                      <p className="text-xs" style={{ color: 'var(--ls-subtle)' }}>No allergies added</p>
                    )}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--ls-muted)' }}>Health conditions</h3>
                      <span className="text-[10px]" style={{ color: 'var(--ls-subtle)' }}>{conditions.length} added</span>
                    </div>
                    {conditions.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {conditions.map((c) => <ProfileTag key={c} tone="amber">{c}</ProfileTag>)}
                      </div>
                    ) : (
                      <p className="text-xs" style={{ color: 'var(--ls-subtle)' }}>No conditions added</p>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--ls-muted)' }}>
                      Dietary preference
                    </h3>
                    <div
                      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
                      style={{ background: 'var(--ls-green-light)', color: 'var(--ls-green)', borderColor: 'var(--ls-border)' }}
                    >
                      <Leaf size={12} /> {diet}
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{ borderColor: 'var(--ls-border)', color: 'var(--ls-green)', background: 'var(--ls-green-light)' }}
                  >
                    Manage profile <ChevronRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="px-4 py-8 text-center sm:px-5">
                  <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ background: 'var(--ls-green-light)', color: 'var(--ls-green)' }}
                  >
                    <UserRound size={20} />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold" style={{ color: 'var(--ls-heading)' }}>Complete your profile</h3>
                  <p className="mx-auto mt-2 max-w-[220px] text-xs leading-5" style={{ color: 'var(--ls-muted)' }}>
                    Add your allergies, health conditions and dietary preferences.
                  </p>
                  <Link to="/setup" className="ls-btn ls-btn-primary mt-4 gap-2 text-sm">
                    Set up profile <ChevronRight size={13} />
                  </Link>
                </div>
              )}
            </section>

            {/* Quick scan CTA */}
            <Link
              to="/scan"
              id="dashboard-quick-scan-card"
              className="group relative block overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #142F20 0%, #22714A 100%)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 rounded-full border border-white/10" />
              <div className="relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white mb-4">
                  <ScanLine size={19} />
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                  Ready to scan?
                </h3>
                <p className="max-w-[200px] text-xs sm:text-sm leading-5 text-white/55 mb-4">
                  Scan a barcode or upload an ingredients label.
                </p>
                <div className="flex items-center justify-between border-t border-white/15 pt-3">
                  <span className="text-sm font-semibold text-white">Start scanning</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white transition-all group-hover:translate-x-1 group-hover:bg-white/20">
                    <ArrowUpRight size={15} />
                  </span>
                </div>
              </div>
            </Link>

            <div className="flex items-start gap-2 px-1">
              <Sparkles size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--ls-green)' }} />
              <p className="text-xs leading-5" style={{ color: 'var(--ls-muted)' }}>
                Your food choices. Your preferences. More informed decisions.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
