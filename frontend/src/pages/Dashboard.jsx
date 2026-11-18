
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ScanLine,
  Search,
  Pencil,
  BarChart3,
  ShieldAlert,
  AlertTriangle,
  CircleCheck,
  Clock3,
  ArrowUpRight,
  Leaf,
  Activity,
  ChevronRight,
  Sparkles,
  UserRound,
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
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function StatCard({ label, value, icon: Icon, tone }) {
  const tones = {
    green: 'bg-[#e8f3ec] text-[#23734d]',
    red: 'bg-[#fcebea] text-[#bd514a]',
    amber: 'bg-[#fbf2df] text-[#a87927]',
    sage: 'bg-[#edf2ec] text-[#607b65]',
  };

  return (
    <div className="group rounded-2xl border border-[#e5eae5] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#b9d4c1] hover:shadow-[0_12px_30px_rgba(28,73,48,0.07)]">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon size={19} strokeWidth={1.8} />
        </div>
        <ArrowUpRight
          size={16}
          className="text-[#a6b2a8] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </div>

      <p className="mt-5 text-2xl font-semibold tracking-tight text-[#193c2a]">
        {value}
      </p>
      <p className="mt-1 text-sm text-[#77847a]">{label}</p>
    </div>
  );
}

function ProfileTag({ children, tone = 'green' }) {
  const styles = {
    green: 'border-[#d8e9dc] bg-[#f0f7f1] text-[#286542]',
    amber: 'border-[#eee2c7] bg-[#fbf6e9] text-[#97712e]',
    red: 'border-[#f0d9d7] bg-[#fdf2f1] text-[#ad514b]',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${styles[tone]}`}>
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
      .catch((error) => {
        console.error('Dashboard data loading failed:', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    if (search.trim()) {
      navigate(`/library?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const firstName =
    profile?.name?.split(' ')[0] ||
    user?.name?.split(' ')[0] ||
    'there';

  // Supports both existing profile response formats.
  const healthProfile = profile?.healthProfile || profile;

  const allergies = healthProfile?.allergies || [];
  const conditions =
    healthProfile?.conditions ||
    profile?.healthConditions ||
    [];

  const diet =
    healthProfile?.diet ||
    profile?.dietPreference ||
    'Not set';

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-8 pb-10 text-[#193c2a]">

      {/* Welcome section */}
      <section className="relative overflow-hidden rounded-[24px] border border-[#dce9df] bg-[#f0f6f0] px-6 py-8 sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-[#d4e5d7] opacity-70" />
        <div className="pointer-events-none absolute -right-2 -top-12 h-52 w-52 rounded-full border border-[#d4e5d7] opacity-70" />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d4e5d7] bg-white/70 px-3 py-1.5">
            <Leaf size={14} className="text-[#28774c]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#427454]">
              Your personal food companion
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[#173c28] sm:text-4xl">
            Welcome back, {firstName}.
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-6 text-[#718078] sm:text-base">
            Make informed food choices with personalized insights.
            Know what goes into your food before it goes into your cart.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 rounded-xl bg-[#20764b] px-5 py-3 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(32,118,75,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#185f3b] hover:shadow-lg"
            >
              <ScanLine size={17} />
              Scan a product
              <ArrowUpRight size={15} />
            </Link>

            <Link
              to="/history"
              className="inline-flex items-center gap-2 rounded-xl border border-[#d5e2d7] bg-white/80 px-5 py-3 text-sm font-semibold text-[#315e40] transition-all hover:border-[#9cbea5] hover:bg-white"
            >
              View scan history
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 right-12 hidden h-56 w-56 items-center justify-center rounded-full bg-[#dcecdf]/60 lg:flex">
          <div className="flex h-36 w-36 items-center justify-center rounded-full border border-white/80 bg-white/60 shadow-sm">
            <Leaf size={65} strokeWidth={1} className="text-[#4d8961]" />
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#193c2a]">
            Explore your food
          </h2>
          <p className="mt-1 text-sm text-[#849087]">
            Search products and ingredients in your library.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex w-full gap-2 sm:max-w-md"
        >
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#89978d]"
            />
            <input
              id="dashboard-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or ingredients"
              aria-label="Search products or ingredients"
              className="h-12 w-full rounded-xl border border-[#e1e8e1] bg-white pl-10 pr-4 text-sm text-[#193c2a] outline-none transition-all placeholder:text-[#a1aaa3] focus:border-[#57946c] focus:ring-4 focus:ring-[#e7f1e9]"
            />
          </div>

          <button
            type="submit"
            className="flex h-12 items-center justify-center rounded-xl bg-[#e8f2e9] px-5 text-sm font-semibold text-[#286542] transition-colors hover:bg-[#dcebdd]"
          >
            Search
          </button>
        </form>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-[#e5eae5] bg-white py-16">
          <InlineLoader message="Loading your dashboard..." />
        </div>
      ) : (
        <>
          {/* Main dashboard grid */}
          <div className="grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.85fr)]">

            {/* Left column */}
            <div className="min-w-0 space-y-7">

              {/* Statistics */}
              <section>
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#829187]">
                      Your activity
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#193c2a]">
                      Scan overview
                    </h2>
                  </div>

                  <span className="text-xs text-[#89968d]">
                    All time
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                  <StatCard
                    icon={BarChart3}
                    label="Total scans"
                    value={stats?.totalScans ?? 0}
                    tone="green"
                  />

                  <StatCard
                    icon={ShieldAlert}
                    label="Avoid"
                    value={stats?.avoid ?? stats?.avoidCount ?? 0}
                    tone="red"
                  />

                  <StatCard
                    icon={AlertTriangle}
                    label="Caution"
                    value={stats?.caution ?? stats?.cautionCount ?? 0}
                    tone="amber"
                  />

                  <StatCard
                    icon={CircleCheck}
                    label="OK"
                    value={stats?.ok ?? stats?.okCount ?? 0}
                    tone="sage"
                  />
                </div>
              </section>

              {/* Recent scans */}
              <section className="overflow-hidden rounded-2xl border border-[#e4eae4] bg-white shadow-[0_3px_15px_rgba(27,65,42,0.035)]">
                <div className="flex items-center justify-between border-b border-[#edf0ed] px-5 py-5 sm:px-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf5ee] text-[#32734a]">
                        <Clock3 size={17} />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-[#193c2a]">
                          Recent scans
                        </h2>
                        <p className="mt-0.5 text-xs text-[#8a968d]">
                          Your latest product analysis
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/history"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#28764a] transition-colors hover:text-[#164e30]"
                  >
                    View all
                    <ArrowUpRight size={15} />
                  </Link>
                </div>

                {recentScans.length === 0 ? (
                  <div className="px-5 py-10">
                    <EmptyState
                      icon={ScanLine}
                      title="No scans yet"
                      description="Your scanned products and their personalized analysis will appear here."
                      action={
                        <Link
                          to="/scan"
                          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#20764b] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#185f3b]"
                        >
                          <ScanLine size={16} />
                          Scan your first product
                        </Link>
                      }
                    />
                  </div>
                ) : (
                  <ul>
                    {recentScans.map((scan, index) => {
                      const productName =
                        scan.productName ||
                        scan.product?.name ||
                        'Unnamed product';

                      const brand =
                        scan.brand ||
                        scan.product?.brand ||
                        'Unknown brand';

                      const verdict =
                        scan.verdict ||
                        scan.overallVerdict ||
                        'UNVERIFIED';

                      const scannedAt =
                        scan.scannedAt ||
                        scan.createdAt;

                      return (
                        <li
                          key={scan._id}
                          className={`group flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-[#f8faf8] sm:px-6 ${
                            index !== recentScans.length - 1
                              ? 'border-b border-[#edf0ed]'
                              : ''
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e5ece6] bg-[#f4f8f4] text-[#4a7857]">
                              <Leaf size={18} strokeWidth={1.7} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#294634]">
                                {productName}
                              </p>
                              <p className="mt-1 truncate text-xs text-[#89968d]">
                                {brand}
                                <span className="mx-1.5 text-[#c4ccc5]">·</span>
                                {formatDate(scannedAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                            <VerdictBadge verdict={verdict} />

                            <Link
                              to={`/result/${scan._id}`}
                              aria-label={`View ${productName} analysis`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#789080] transition-all hover:bg-[#eaf3eb] hover:text-[#247348]"
                            >
                              <ArrowUpRight size={17} />
                            </Link>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Information banner */}
              <section className="flex items-start gap-4 rounded-2xl border border-[#dce9df] bg-[#f1f7f1] p-5 sm:p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#34794e] shadow-sm">
                  <Activity size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#28563a]">
                    Better food choices start with awareness
                  </h3>
                  <p className="mt-1.5 max-w-xl text-xs leading-5 text-[#75877a]">
                    FoodLens analyzes product ingredients against your
                    saved profile to help you understand potential concerns.
                    Always consult a qualified professional for medical advice.
                  </p>
                </div>
              </section>
            </div>

            {/* Right column */}
            <aside className="space-y-5">

              {/* Health profile */}
              <section className="overflow-hidden rounded-2xl border border-[#e3eae3] bg-white shadow-[0_3px_15px_rgba(27,65,42,0.035)]">
                <div className="flex items-center justify-between border-b border-[#edf0ed] px-5 py-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8a978d]">
                      Personal information
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-[#193c2a]">
                      Health profile
                    </h2>
                  </div>

                  <Link
                    to="/profile"
                    id="dashboard-edit-profile-btn"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf5ee] text-[#32734a] transition-colors hover:bg-[#dfeee2]"
                    aria-label="Edit health profile"
                  >
                    <Pencil size={15} />
                  </Link>
                </div>

                {profile ? (
                  <div className="space-y-6 p-5">

                    {/* Profile identity */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf3eb] text-[#33764b]">
                        <UserRound size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#294634]">
                          {profile.name || user?.name || 'Your profile'}
                        </p>
                        <p className="mt-0.5 text-xs text-[#8a968d]">
                          Personalized food preferences
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-[#edf0ed]" />

                    {/* Allergies */}
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#77877b]">
                          Allergies
                        </h3>
                        <span className="text-[11px] text-[#9aa59c]">
                          {allergies.length} added
                        </span>
                      </div>

                      {allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {allergies.map((allergy) => (
                            <ProfileTag key={allergy} tone="red">
                              {allergy}
                            </ProfileTag>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#9aa59c]">
                          No allergies added
                        </p>
                      )}
                    </div>

                    {/* Conditions */}
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#77877b]">
                          Health conditions
                        </h3>
                        <span className="text-[11px] text-[#9aa59c]">
                          {conditions.length} added
                        </span>
                      </div>

                      {conditions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {conditions.map((condition) => (
                            <ProfileTag key={condition} tone="amber">
                              {condition}
                            </ProfileTag>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#9aa59c]">
                          No conditions added
                        </p>
                      )}
                    </div>

                    {/* Diet */}
                    <div>
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#77877b]">
                        Dietary preference
                      </h3>

                      <div className="inline-flex items-center gap-2 rounded-full border border-[#d8e9dc] bg-[#f0f7f1] px-3 py-2 text-xs font-semibold text-[#286542]">
                        <Leaf size={14} />
                        {diet}
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#dce8de] py-3 text-sm font-semibold text-[#32734a] transition-colors hover:bg-[#f2f7f2]"
                    >
                      Manage profile
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div className="px-5 py-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#edf5ee] text-[#34794e]">
                      <UserRound size={21} />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-[#294634]">
                      Complete your profile
                    </h3>

                    <p className="mx-auto mt-2 max-w-[240px] text-xs leading-5 text-[#87948a]">
                      Add your allergies, health conditions and dietary
                      preferences for personalized food analysis.
                    </p>

                    <Link
                      to="/setup"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#20764b] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#185f3b]"
                    >
                      Set up profile
                      <ChevronRight size={15} />
                    </Link>
                  </div>
                )}
              </section>

              {/* Quick scan card */}
              <Link
                to="/scan"
                id="dashboard-quick-scan-card"
                className="group relative block overflow-hidden rounded-2xl bg-[#194d32] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(25,77,50,0.2)]"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-full border border-white/10" />

                <div className="relative z-10">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white">
                    <ScanLine size={21} />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold text-white">
                    Ready to scan?
                  </h3>

                  <p className="mt-2 max-w-[240px] text-sm leading-6 text-white/65">
                    Scan a barcode or upload an ingredients label to
                    understand your food better.
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-4">
                    <span className="text-sm font-semibold text-white">
                      Start scanning
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-all group-hover:translate-x-1 group-hover:bg-white/20">
                      <ArrowUpRight size={17} />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Brand note */}
              <div className="flex items-start gap-3 px-1 py-2">
                <Sparkles size={16} className="mt-0.5 shrink-0 text-[#72977a]" />
                <p className="text-xs leading-5 text-[#89968d]">
                  Your food choices. Your preferences. More informed decisions.
                </p>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
