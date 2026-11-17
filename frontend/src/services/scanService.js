// src/services/scanService.js
import api, { USE_MOCK } from './api.js';
import { MOCK_SCAN_RESULT } from './mockAdapter.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Normalizes a backend scan result to the shape the frontend expects:
 *   verdict (lowercase), productName, brand, quantity, imageUrl,
 *   ingredients (string[]), conflictingIngredients, nutrition, scanId
 */
function normalizeScanResult(data) {
  const product = data.product || {};
  const verdict = (data.overallVerdict || 'UNKNOWN').toLowerCase();

  // Map backend warnings to frontend conflictingIngredients
  const conflictingIngredients = (data.warnings || []).map((w) => ({
    name: w.ingredient || w.allergen || '',
    reason: w.message?.en || '',
    verdict: w.severity === 'avoid' ? 'avoid' : w.severity === 'caution' ? 'caution' : 'ok',
    source: w.ruleType || w.type || '',
  })).filter((c) => c.name);

  // Nutrition: map backend keys to frontend display strings
  const n = data.nutrition || {};
  const nutrition = (n.energyKcal100g != null || n.sugars100g != null) ? {
    servingSize: '100g',
    energy: n.energyKcal100g != null ? `${n.energyKcal100g} kcal` : null,
    sugar: n.sugars100g != null ? `${n.sugars100g}g` : null,
    sodium: n.sodium100g != null ? `${(n.sodium100g * 1000).toFixed(0)}mg` : null,
    fat: n.fat100g != null ? `${n.fat100g}g` : null,
    protein: n.proteins100g != null ? `${n.proteins100g}g` : null,
    carbohydrates: n.carbohydrates100g != null ? `${n.carbohydrates100g}g` : null,
  } : null;

  return {
    _id: data.scanId || data._id,
    productName: product.name || data.ingredientsText?.slice(0, 40) || 'Unknown product',
    brand: product.brand || '',
    quantity: product.quantity || null,
    imageUrl: product.image || null,
    barcode: data.barcode || null,
    verdict,
    verdictSummary: data.summary || '',
    conflictingIngredients,
    ingredients: data.product?.ingredients || data.scannedIngredients?.map((i) => i.name) || [],
    unmatchedIngredients: data.unmatchedIngredients || [],
    nutrition,
    disclaimer: 'Label Sach provides ingredient analysis based on FSSAI data and published health guidelines. This is not medical advice.',
    scannedAt: data.createdAt || new Date().toISOString(),
    isSaved: data.isSaved || false,
  };
}

/**
 * Normalize a scan history item (lighter shape).
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
  };
}

export const scanService = {
  async scanBarcode(barcode) {
    if (USE_MOCK) {
      await delay(1200);
      return { ...MOCK_SCAN_RESULT, barcode, _id: 'scan-' + Date.now() };
    }
    const { data } = await api.post('/scan/barcode', { barcode });
    return normalizeScanResult(data);
  },

  /**
   * OCR image scan – sends image file as multipart/form-data.
   * FormData must have key 'image'.
   */
  async scanIngredients(formData) {
    if (USE_MOCK) {
      await delay(1500);
      return { ...MOCK_SCAN_RESULT, _id: 'scan-' + Date.now() };
    }
    const { data } = await api.post('/scan/ocr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeScanResult(data);
  },

  /**
   * Manual ingredient text scan.
   */
  async scanManual(ingredients) {
    if (USE_MOCK) {
      await delay(1200);
      return { ...MOCK_SCAN_RESULT, _id: 'scan-' + Date.now() };
    }
    const payload = Array.isArray(ingredients) ? { ingredients } : { ingredients: [ingredients] };
    const { data } = await api.post('/scan/ingredients', payload);
    return normalizeScanResult(data);
  },

  async getScanById(id) {
    if (USE_MOCK) {
      await delay(400);
      return MOCK_SCAN_RESULT;
    }
    const { data } = await api.get(`/scan/${id}`);
    return normalizeScanResult(data.scan || data);
  },

  async saveScan(id, isSaved = true) {
    if (USE_MOCK) {
      await delay(300);
      return { success: true };
    }
    // Backend: PATCH /scans/history/:id/save  with { isSaved }
    const { data } = await api.patch(`/scans/history/${id}/save`, { isSaved });
    return data;
  },

  async deleteScan(id) {
    if (USE_MOCK) {
      await delay(300);
      return { success: true };
    }
    const { data } = await api.delete(`/scans/history/${id}`);
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

  async getHistory(params = {}) {
    if (USE_MOCK) {
      await delay(500);
      return { scans: [], total: 0, pagination: { totalPages: 1 } };
    }
    const { data } = await api.get('/scan/history', { params });
    return {
      ...data,
      scans: (data.scans || []).map(normalizeHistoryItem),
    };
  },
};
