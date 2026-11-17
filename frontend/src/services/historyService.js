// src/services/historyService.js
import api, { USE_MOCK } from './api.js';
import { MOCK_SCAN_HISTORY, MOCK_STATS } from './mockAdapter.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Map backend stats shape to frontend shape:
 * Backend: { stats: { totalScans, avoidCount, cautionCount, okCount, unknownCount, savedCount } }
 * Frontend reads: { totalScans, avoid, caution, ok, unknown }
 */
function normalizeStats(data) {
  const s = data.stats || data;
  return {
    totalScans: s.totalScans ?? 0,
    avoid: s.avoidCount ?? s.avoid ?? 0,
    caution: s.cautionCount ?? s.caution ?? 0,
    ok: s.okCount ?? s.ok ?? 0,
    unknown: s.unknownCount ?? s.unknown ?? 0,
    saved: s.savedCount ?? s.saved ?? 0,
  };
}

/**
 * Normalize a scan history item for consistent frontend shape.
 */
function normalizeHistoryItem(scan) {
  const product = scan.product || {};
  return {
    ...scan,
    productName: product.name || (scan.ingredients?.slice(0, 2).join(', ')) || 'Manual scan',
    brand: product.brand || '',
    imageUrl: product.image || null,
    verdict: (scan.overallVerdict || 'UNKNOWN').toLowerCase(),
    scannedAt: scan.createdAt,
    saved: scan.isSaved || false,
  };
}

export const historyService = {
  async getHistory({ page = 1, limit = 10, verdict = 'all', saved = undefined } = {}) {
    if (USE_MOCK) {
      await delay(500);
      let results = [...MOCK_SCAN_HISTORY];
      if (verdict !== 'all') {
        if (verdict === 'saved') {
          results = results.filter((s) => s.saved);
        } else {
          results = results.filter((s) => s.verdict === verdict);
        }
      }
      const total = results.length;
      const start = (page - 1) * limit;
      return {
        scans: results.slice(start, start + limit),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }

    const params = { page, limit };
    if (verdict && verdict !== 'all') params.verdict = verdict.toUpperCase();
    if (saved !== undefined) params.saved = saved;

    const { data } = await api.get('/scan/history', { params });

    return {
      scans: (data.scans || []).map(normalizeHistoryItem),
      total: data.pagination?.totalScan ?? data.total ?? 0,
      page: data.pagination?.page ?? page,
      totalPages: data.pagination?.totalPages ?? 1,
      hasNextPage: data.pagination?.hasNextPage ?? false,
      hasPreviousPage: data.pagination?.hasPreviousPage ?? false,
    };
  },

  async getStats() {
    if (USE_MOCK) {
      await delay(300);
      return MOCK_STATS;
    }
    // Backend: GET /scan/stats  returns { success, stats: { totalScans, avoidCount, ... } }
    const { data } = await api.get('/scan/stats');
    return normalizeStats(data);
  },

  async deleteScan(id) {
    if (USE_MOCK) {
      await delay(300);
      return { success: true };
    }
    const { data } = await api.delete(`/scans/history/${id}`);
    return data;
  },

  async toggleSave(id, isSaved) {
    if (USE_MOCK) {
      await delay(300);
      return { success: true };
    }
    const { data } = await api.patch(`/scans/history/${id}/save`, { isSaved });
    return data;
  },

  async reportScan(id, reportType, description = '') {
    if (USE_MOCK) {
      await delay(400);
      return { success: true };
    }
    const { data } = await api.post(`/scans/history/${id}/report`, { reportType, description });
    return data;
  },
};
