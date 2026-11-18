
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
  { value: 'all', label: 'All scans' },
  { value: 'avoid', label: 'Avoid' },
  { value: 'caution', label: 'Caution' },
  { value: 'ok', label: 'OK' },
  { value: 'saved', label: 'Saved' },
];

const LIMIT = 10;

const surface = 'bg-[var(--ls-surface)]';
const border = 'border-[var(--ls-border)]';
const heading = 'text-[var(--ls-heading)]';
const bodyText = 'text-[var(--ls-text)]';
const muted = 'text-[var(--ls-text-muted)]';

function formatDateTime(isoString) {
  if (!isoString) return '—';

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

function ProductIcon() {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
      style={{
        background: 'var(--ls-green-soft)',
        borderColor: 'var(--ls-border)',
        color: 'var(--ls-green)',
      }}
    >
      <Leaf size={19} strokeWidth={1.6} />
    </div>
  );
}

function HistoryCard({ scan }) {
  return (
    <article
      className={`group rounded-2xl border ${border} ${surface} p-4 transition-all duration-200 hover:shadow-[var(--ls-shadow-soft)]`}
      style={{ transitionProperty: 'border-color, box-shadow, transform' }}
    >
      <div className="flex items-start gap-3">
        <ProductIcon />

        <div className="min-w-0 flex-1">
          <h3 className={`truncate text-sm font-semibold ${heading}`}>
            {getProductName(scan)}
          </h3>
          <p className={`mt-1 truncate text-xs ${muted}`}>
            {getBrand(scan)}
          </p>
        </div>

        <VerdictBadge verdict={getVerdict(scan)} />
      </div>

      <div
        className={`mt-4 flex items-center justify-between gap-3 border-t ${border} pt-3`}
      >
        <div className={`flex items-center gap-1.5 text-xs ${muted}`}>
          <CalendarDays size={14} />
          {formatDateTime(getScanDate(scan))}
        </div>

        <Link
          to={`/result/${scan._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
          style={{ color: 'var(--ls-green)' }}
        >
          View details
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </article>
  );
}

export default function History() {
  const [scans, setScans] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

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
    <main className="mx-auto w-full max-w-[1440px] space-y-7 pb-10 animate-fade-in">

      {/* Page heading */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
            style={{
              background: 'var(--ls-green-soft)',
              borderColor: 'var(--ls-border)',
              color: 'var(--ls-green)',
            }}
          >
            <HistoryIcon size={13} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">
              Your activity
            </span>
          </div>

          <h1 className={`text-3xl font-semibold tracking-tight ${heading}`}>
            Scan history
          </h1>

          <p className={`mt-2 max-w-xl text-sm leading-6 ${muted}`}>
            Revisit your previously scanned products and their personalized analysis.
          </p>
        </div>

        <div
          className={`flex items-center gap-3 self-start rounded-2xl border ${border} ${surface} px-5 py-3.5 shadow-[var(--ls-shadow-soft)] sm:self-auto`}
        >
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{
              background: 'var(--ls-green-soft)',
              color: 'var(--ls-green)',
            }}
          >
            <ScanLine size={20} strokeWidth={1.7} />
          </div>

          <div>
            <p className={`text-2xl font-semibold leading-none ${heading}`}>
              {total}
            </p>
            <p className={`mt-1 text-[11px] ${muted}`}>Total scans</p>
          </div>
        </div>
      </section>

      {/* Search and filters */}
      <section
        className={`rounded-2xl border ${border} ${surface} p-5 shadow-[var(--ls-shadow-soft)] sm:p-6`}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className={`text-sm font-semibold ${heading}`}>
                Find a scanned product
              </h2>
              <p className={`mt-1 text-xs ${muted}`}>
                Search by product name or brand.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search
                size={17}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${muted}`}
              />

              <input
                id="history-search"
                type="search"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search products or brands..."
                aria-label="Search scan history"
                className={`h-11 w-full rounded-xl border ${border} pl-10 pr-4 text-sm outline-none transition-all placeholder:text-[var(--ls-text-subtle)] focus:border-[var(--ls-green)] focus:ring-4 focus:ring-[var(--ls-green-soft)]`}
                style={{
                  background: 'var(--ls-bg)',
                  color: 'var(--ls-text)',
                }}
              />
            </div>
          </div>

          <div className={`h-px w-full ${border}`} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className={`flex items-center gap-2 ${muted}`}>
              <Filter size={15} />
              <span className="text-xs font-semibold">Filter by verdict</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((item) => {
                const active = filter === item.value;

                return (
                  <button
                    key={item.value}
                    id={`history-filter-${item.value}`}
                    type="button"
                    onClick={() => handleFilterChange(item.value)}
                    aria-pressed={active}
                    className="rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all duration-200"
                    style={
                      active
                        ? {
                            background: 'var(--ls-green)',
                            borderColor: 'var(--ls-green)',
                            color: '#FFFFFF',
                            boxShadow: '0 3px 10px rgba(35, 100, 65, 0.16)',
                          }
                        : {
                            background: 'var(--ls-surface)',
                            borderColor: 'var(--ls-border)',
                            color: 'var(--ls-text-muted)',
                          }
                    }
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Results heading */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className={`text-base font-semibold ${heading}`}>
            Your scanned products
          </h2>
          <p className={`mt-1 text-xs ${muted}`}>
            {loading
              ? 'Updating results...'
              : `${scans.length} products on this page`}
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
            style={{ color: 'var(--ls-green)' }}
          >
            <RotateCcw size={13} />
            Clear filters
          </button>
        )}
      </div>

      {/* History content */}
      <section className={`overflow-hidden rounded-2xl border ${border} ${surface} shadow-[var(--ls-shadow-soft)]`}>
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <InlineLoader message="Loading your scan history..." />
          </div>
        ) : error ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-5 text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                background: 'var(--ls-red-light)',
                color: 'var(--ls-red)',
              }}
            >
              <HistoryIcon size={21} />
            </div>

            <h3 className={`mt-4 text-sm font-semibold ${heading}`}>
              Something went wrong
            </h3>

            <p className={`mt-2 max-w-sm text-xs leading-5 ${muted}`}>
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
                    style={{
                      borderColor: 'var(--ls-border)',
                      color: 'var(--ls-green)',
                    }}
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
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      background: 'var(--ls-sidebar)',
                      borderColor: 'var(--ls-border)',
                    }}
                  >
                    {['Product', 'Brand', 'Date & time', 'Verdict', ''].map(
                      (column, index) => (
                        <th
                          key={`${column}-${index}`}
                          className={`px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.13em] ${muted}`}
                        >
                          {column}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {scans.map((scan, index) => {
                    const lastRow = index === scans.length - 1;

                    return (
                      <tr
                        key={scan._id}
                        className="transition-colors"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--ls-green-soft)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <td
                          className={`px-6 py-4 ${!lastRow ? `border-b ${border}` : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <ProductIcon />
                            <span className={`max-w-[220px] truncate text-sm font-semibold ${heading}`}>
                              {getProductName(scan)}
                            </span>
                          </div>
                        </td>

                        <td
                          className={`px-6 py-4 text-sm ${muted} ${!lastRow ? `border-b ${border}` : ''}`}
                        >
                          {getBrand(scan)}
                        </td>

                        <td
                          className={`px-6 py-4 text-xs ${muted} ${!lastRow ? `border-b ${border}` : ''}`}
                        >
                          {formatDateTime(getScanDate(scan))}
                        </td>

                        <td
                          className={`px-6 py-4 ${!lastRow ? `border-b ${border}` : ''}`}
                        >
                          <VerdictBadge verdict={getVerdict(scan)} />
                        </td>

                        <td
                          className={`px-6 py-4 text-right ${!lastRow ? `border-b ${border}` : ''}`}
                        >
                          <Link
                            to={`/result/${scan._id}`}
                            id={`view-scan-${scan._id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
                            style={{ color: 'var(--ls-green)' }}
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

            {/* Mobile cards */}
            <div
              className="grid grid-cols-1 gap-3 p-3 md:hidden"
              style={{ background: 'var(--ls-bg)' }}
            >
              {scans.map((scan) => (
                <HistoryCard key={scan._id} scan={scan} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Pagination */}
      {!loading && !error && scans.length > 0 && (
        <div
          className={`flex flex-col gap-4 rounded-2xl border ${border} ${surface} px-5 py-4 sm:flex-row sm:items-center sm:justify-between`}
        >
          <p className={`text-xs ${muted}`}>
            Showing{' '}
            <span className={`font-semibold ${heading}`}>
              {(page - 1) * LIMIT + 1}–{(page - 1) * LIMIT + scans.length}
            </span>
            {' '}of{' '}
            <span className={`font-semibold ${heading}`}>{total}</span>
            {' '}results
          </p>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className={`text-xs font-medium ${muted}`}>
              Page {page} of {pages}
            </span>

            <div className="flex items-center gap-2">
              <button
                id="history-prev-btn"
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className={`flex h-9 w-9 items-center justify-center rounded-xl border ${border} ${bodyText} transition-colors disabled:cursor-not-allowed disabled:opacity-40`}
                style={{ background: 'var(--ls-surface)' }}
              >
                <ChevronLeft size={17} />
              </button>

              <button
                id="history-next-btn"
                type="button"
                onClick={() => setPage((current) => Math.min(pages, current + 1))}
                disabled={page === pages}
                aria-label="Next page"
                className={`flex h-9 w-9 items-center justify-center rounded-xl border ${border} ${bodyText} transition-colors disabled:cursor-not-allowed disabled:opacity-40`}
                style={{ background: 'var(--ls-surface)' }}
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer note */}
      <div className="flex items-start gap-3 px-1 py-2">
        <Leaf
          size={15}
          className="mt-0.5 shrink-0"
          style={{ color: 'var(--ls-green)' }}
        />
        <p className={`text-xs leading-5 ${muted}`}>
          Your scan history helps you revisit previous product analyses and make more informed food choices.
        </p>
      </div>
    </main>
  );
}
