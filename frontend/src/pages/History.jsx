
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  History as HistoryIcon,
  ScanLine,
  ArrowUpRight,
  Leaf,
  CalendarDays,
  RotateCcw,
} from 'lucide-react';

import { historyService } from '../services/historyService.js';
import { VerdictBadge } from '../components/common/Badge.jsx';
import { InlineLoader } from '../components/common/Spinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

const FILTERS = [
  { value: 'all',    label: 'All scans' },
  { value: 'avoid',  label: 'Avoid' },
  { value: 'caution',label: 'Caution' },
  { value: 'ok',     label: 'OK' },
  { value: 'saved',  label: 'Saved' },
];

const LIMIT = 10;

function formatDateTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(date);
}

function getProductName(scan) {
  return scan.productName || scan.product?.name || 'Unnamed product';
}

function getBrand(scan) {
  return scan.brand || scan.product?.brand || 'Unknown brand';
}

function getVerdict(scan) {
  return scan.verdict || scan.overallVerdict || 'UNVERIFIED';
}

function getScanDate(scan) {
  return scan.scannedAt || scan.createdAt;
}

export default function History() {
  const [scans, setScans]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page,   setPage]   = useState(1);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await historyService.getHistory({
        page,
        limit: LIMIT,
        verdict: filter,
        search: search.trim(),
      });
      setScans(data?.scans || []);
      setTotal(data?.total || 0);
      setPages(data?.totalPages || data?.pages || 1);
    } catch (err) {
      console.error('Failed to fetch scan history:', err);
      setScans([]);
      setTotal(0);
      setPages(1);
      setError('Unable to load your scan history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setFilter('all');
    setPage(1);
  };

  const hasActiveFilters = search.trim() !== '' || filter !== 'all';

  return (
    <main className="w-full space-y-6 pb-10 animate-fade-in" style={{ color: 'var(--ls-text)' }}>

      {/* Page header */}
      <section>
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
          style={{ background: 'var(--ls-green-soft)', borderColor: 'var(--ls-border)', color: 'var(--ls-green)' }}
        >
          <HistoryIcon size={13} />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em]">Your activity</span>
        </div>

        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: 'var(--ls-heading)', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
        >
          Scan History
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6" style={{ color: 'var(--ls-muted)' }}>
          Revisit your previously scanned products and their personalized analysis.
        </p>
      </section>

      {/* Search + Filter bar */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--ls-subtle)' }}
          />
          <input
            id="history-search"
            type="search"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search products or brands..."
            aria-label="Search scan history"
            className="ls-input h-11 w-full pl-10"
          />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="hidden items-center gap-1.5 text-xs font-semibold sm:flex"
            style={{ color: 'var(--ls-muted)' }}
          >
            <Filter size={14} />
            Filter:
          </span>

          {FILTERS.map((item) => {
            const active = filter === item.value;
            return (
              <button
                key={item.value}
                id={`history-filter-${item.value}`}
                type="button"
                onClick={() => handleFilterChange(item.value)}
                aria-pressed={active}
                className="rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150"
                style={
                  active
                    ? {
                        background: 'var(--ls-green)',
                        borderColor: 'var(--ls-green)',
                        color: '#fff',
                        boxShadow: '0 2px 8px rgba(35,100,65,0.18)',
                      }
                    : {
                        background: 'var(--ls-surface)',
                        borderColor: 'var(--ls-border)',
                        color: 'var(--ls-muted)',
                      }
                }
              >
                {item.label}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-80"
              style={{ color: 'var(--ls-green)', background: 'var(--ls-green-light)' }}
            >
              <RotateCcw size={12} />
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Results meta row */}
      <div className="flex items-center justify-between px-0.5">
        <p className="text-xs" style={{ color: 'var(--ls-muted)' }}>
          {loading ? 'Updating results…' : `${scans.length} products on this page`}
        </p>
      </div>

      {/* Main list card */}
      <section
        className="overflow-hidden rounded-2xl border"
        style={{ background: 'var(--ls-surface)', borderColor: 'var(--ls-border)', boxShadow: 'var(--shadow-card)' }}
      >
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <InlineLoader message="Loading your scan history..." />
          </div>
        ) : error ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-5 text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: 'var(--ls-red-light)', color: 'var(--ls-red)' }}
            >
              <HistoryIcon size={21} />
            </div>
            <h3 className="mt-4 text-sm font-semibold" style={{ color: 'var(--ls-heading)' }}>
              Something went wrong
            </h3>
            <p className="mt-2 max-w-sm text-xs leading-5" style={{ color: 'var(--ls-muted)' }}>
              {error}
            </p>
            <button
              type="button"
              onClick={fetchHistory}
              className="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--ls-green)' }}
            >
              Try again
            </button>
          </div>
        ) : scans.length === 0 ? (
          <div className="px-5 py-12">
            <EmptyState
              icon={HistoryIcon}
              title="No scans found"
              description={
                hasActiveFilters
                  ? 'No products match your current search or filter. Try adjusting them.'
                  : 'Your scan history will appear here once you scan your first product.'
              }
              action={
                hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-2 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
                    style={{ borderColor: 'var(--ls-border)', color: 'var(--ls-green)' }}
                  >
                    <RotateCcw size={15} />
                    Clear filters
                  </button>
                ) : (
                  <Link
                    to="/scan"
                    className="mt-2 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                    style={{ background: 'var(--ls-green)' }}
                  >
                    <ScanLine size={16} />
                    Scan a product
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <>
            {/* Desktop table view */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr
                    className="border-b"
                    style={{ background: 'var(--ls-sidebar)', borderColor: 'var(--ls-border)' }}
                  >
                    {['Product', 'Brand', 'Date & time', 'Verdict', ''].map((col, i) => (
                      <th
                        key={`${col}-${i}`}
                        className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.13em]"
                        style={{ color: 'var(--ls-muted)' }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {scans.map((scan, index) => {
                    const lastRow = index === scans.length - 1;
                    return (
                      <tr
                        key={scan._id}
                        className="transition-colors"
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ls-green-soft)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td className={`px-6 py-4${!lastRow ? ' border-b' : ''}`} style={{ borderColor: 'var(--ls-border)' }}>
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                              style={{ background: 'var(--ls-green-soft)', borderColor: 'var(--ls-border)', color: 'var(--ls-green)' }}
                            >
                              <Leaf size={18} strokeWidth={1.6} />
                            </div>
                            <span
                              className="max-w-[200px] truncate text-sm font-semibold"
                              style={{ color: 'var(--ls-heading)' }}
                            >
                              {getProductName(scan)}
                            </span>
                          </div>
                        </td>

                        <td
                          className={`px-6 py-4 text-sm${!lastRow ? ' border-b' : ''}`}
                          style={{ borderColor: 'var(--ls-border)', color: 'var(--ls-muted)' }}
                        >
                          {getBrand(scan)}
                        </td>

                        <td
                          className={`px-6 py-4 text-xs${!lastRow ? ' border-b' : ''}`}
                          style={{ borderColor: 'var(--ls-border)', color: 'var(--ls-muted)' }}
                        >
                          <div className="flex items-center gap-1.5">
                            <CalendarDays size={13} style={{ color: 'var(--ls-subtle)' }} />
                            {formatDateTime(getScanDate(scan))}
                          </div>
                        </td>

                        <td className={`px-6 py-4${!lastRow ? ' border-b' : ''}`} style={{ borderColor: 'var(--ls-border)' }}>
                          <VerdictBadge verdict={getVerdict(scan)} />
                        </td>

                        <td
                          className={`px-6 py-4 text-right${!lastRow ? ' border-b' : ''}`}
                          style={{ borderColor: 'var(--ls-border)' }}
                        >
                          <Link
                            to={`/result/${scan._id}`}
                            id={`view-scan-${scan._id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:opacity-80"
                            style={{ color: 'var(--ls-green)', background: 'var(--ls-green-light)' }}
                          >
                            View details
                            <ArrowUpRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile list rows */}
            <ul className="md:hidden">
              {scans.map((scan, index) => (
                <li
                  key={scan._id}
                  className={`flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-[var(--ls-green-soft)]${index !== scans.length - 1 ? ' border-b' : ''}`}
                  style={{ borderColor: 'var(--ls-border)' }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                      style={{ background: 'var(--ls-green-soft)', borderColor: 'var(--ls-border)', color: 'var(--ls-green)' }}
                    >
                      <Leaf size={17} strokeWidth={1.7} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--ls-heading)' }}>
                        {getProductName(scan)}
                      </p>
                      <p className="mt-0.5 truncate text-xs" style={{ color: 'var(--ls-muted)' }}>
                        {getBrand(scan)}
                        <span className="mx-1.5" style={{ color: 'var(--ls-subtle)' }}>·</span>
                        {formatDateTime(getScanDate(scan))}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <VerdictBadge verdict={getVerdict(scan)} />
                    <Link
                      to={`/result/${scan._id}`}
                      id={`view-scan-${scan._id}`}
                      aria-label={`View ${getProductName(scan)} analysis`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:opacity-80"
                      style={{ color: 'var(--ls-muted)', background: 'var(--ls-green-soft)' }}
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* Pagination */}
      {!loading && !error && scans.length > 0 && (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between sm:gap-0">
          <p className="text-xs" style={{ color: 'var(--ls-muted)' }}>
            Showing{' '}
            <span className="font-semibold" style={{ color: 'var(--ls-heading)' }}>
              {(page - 1) * LIMIT + 1}–{(page - 1) * LIMIT + scans.length}
            </span>
            {' '}of{' '}
            <span className="font-semibold" style={{ color: 'var(--ls-heading)' }}>{total}</span>
            {' '}results
          </p>

          <div className="flex items-center gap-3">
            <button
              id="history-prev-btn"
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="flex h-9 items-center gap-1.5 rounded-xl border px-4 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-80"
              style={{ background: 'var(--ls-surface)', borderColor: 'var(--ls-border)', color: 'var(--ls-text)' }}
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            <span
              className="rounded-xl border px-4 py-2 text-sm font-semibold"
              style={{ background: 'var(--ls-green-light)', borderColor: 'var(--ls-border)', color: 'var(--ls-green)' }}
            >
              {page} / {pages}
            </span>

            <button
              id="history-next-btn"
              type="button"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              aria-label="Next page"
              className="flex h-9 items-center gap-1.5 rounded-xl border px-4 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-80"
              style={{ background: 'var(--ls-surface)', borderColor: 'var(--ls-border)', color: 'var(--ls-text)' }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Footer note */}
      <div className="flex items-start gap-2.5 px-0.5">
        <Leaf size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--ls-green)' }} />
        <p className="text-xs leading-5" style={{ color: 'var(--ls-muted)' }}>
          Your scan history helps you revisit previous product analyses and make more informed food choices.
        </p>
      </div>
    </main>
  );
}
