// src/pages/History.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, History as HistoryIcon } from 'lucide-react';
import { historyService } from '../services/historyService.js';
import { VerdictBadge } from '../components/common/Badge.jsx';
import { InlineLoader } from '../components/common/Spinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'avoid', label: 'Avoid' },
  { value: 'caution', label: 'Caution' },
  { value: 'ok', label: 'OK' },
  { value: 'saved', label: 'Saved' },
];

function formatDateTime(isoString) {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(isoString));
}

export default function History() {
  const [scans, setScans] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const LIMIT = 10;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await historyService.getHistory({
        page, limit: LIMIT, verdict: filter, search,
      });
      setScans(data.scans || []);
      setTotal(data.total || 0);
      setPages(data.totalPages || data.pages || 1);
    } catch {
      setScans([]);
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Reset to page 1 when filter/search changes
  useEffect(() => { setPage(1); }, [filter, search]);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-7">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ls-text)' }}>Scan History</h1>
        <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>
          All your past product scans — {total} total
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ls-muted)' }} />
          <input
            id="history-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product or brand…"
            className="ls-input pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              id={`history-filter-${f.value}`}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value ? 'text-white ls-brand-gradient' : ''
              }`}
              style={filter !== f.value ? {
                background: 'var(--ls-surface)',
                color: 'var(--ls-muted)',
                border: '1px solid var(--ls-border)',
              } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="ls-surface overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        {loading ? (
          <InlineLoader message="Loading history…" />
        ) : scans.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No scans found"
            description={search || filter !== 'all' ? 'Try adjusting your search or filter.' : 'Your scan history will appear here once you scan your first product.'}
            action={
              search || filter !== 'all' ? (
                <button
                  onClick={() => { setSearch(''); setFilter('all'); }}
                  className="ls-btn ls-btn-secondary text-sm px-4 py-2"
                >
                  Clear filters
                </button>
              ) : (
                <Link to="/scan" className="ls-btn ls-btn-primary text-sm px-4 py-2">
                  Scan a product
                </Link>
              )
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ls-border)', background: 'var(--ls-bg)' }}>
                    {['Product', 'Brand', 'Date & Time', 'Verdict', ''].map((col) => (
                      <th
                        key={col}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--ls-muted)' }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scans.map((scan, idx) => (
                    <tr
                      key={scan._id}
                      className="hover:bg-[var(--ls-bg)] transition-colors"
                      style={{ borderBottom: idx < scans.length - 1 ? '1px solid var(--ls-border)' : 'none' }}
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-sm" style={{ color: 'var(--ls-text)' }}>
                          {scan.productName}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm" style={{ color: 'var(--ls-muted)' }}>{scan.brand}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm" style={{ color: 'var(--ls-muted)' }}>
                          {formatDateTime(scan.scannedAt)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <VerdictBadge verdict={scan.verdict} />
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          to={`/result/${scan._id}`}
                          className="text-sm font-medium hover:underline"
                          style={{ color: 'var(--ls-green)' }}
                          id={`view-scan-${scan._id}`}
                        >
                          View details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y" style={{ borderColor: 'var(--ls-border)' }}>
              {scans.map((scan) => (
                <div key={scan._id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-medium text-sm" style={{ color: 'var(--ls-text)' }}>
                      {scan.productName}
                    </span>
                    <VerdictBadge verdict={scan.verdict} />
                  </div>
                  <p className="text-xs mb-2" style={{ color: 'var(--ls-muted)' }}>
                    {scan.brand} · {formatDateTime(scan.scannedAt)}
                  </p>
                  <Link
                    to={`/result/${scan._id}`}
                    className="text-xs font-medium hover:underline"
                    style={{ color: 'var(--ls-green)' }}
                  >
                    View details →
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>
            Page {page} of {pages} · {total} results
          </p>
          <div className="flex gap-2">
            <button
              id="history-prev-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="ls-btn ls-btn-ghost px-3 py-2 text-sm disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              id="history-next-btn"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="ls-btn ls-btn-ghost px-3 py-2 text-sm disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
