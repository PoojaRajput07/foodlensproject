
// src/services/scanService.js

import api, { USE_MOCK } from './api.js';
import { MOCK_SCAN_RESULT } from './mockAdapter.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Normalize backend scan response.
 *
 * IMPORTANT:
 * Preserve the complete new backend response:
 * - aiAnalysis
 * - personalizedAssessment
 * - ingredientAnalysis
 * - product.productAnalysis
 * - raw nutrition values
 */
function normalizeScanResult(data) {
  const product = data.product || {};

  const nutrition = data.nutrition || {};

  const verdict = (
    data.overallVerdict ||
    data.verdict ||
    data.aiAnalysis?.personalizedAssessment?.status ||
    data.aiAnalysis?.overallAssessment ||
    'UNVERIFIED'
  ).toUpperCase();

  const ingredients =
    product.ingredients ||
    data.ingredients ||
    data.scannedIngredients?.map((item) =>
      typeof item === 'string' ? item : item.name
    ) ||
    [];

  return {
    // Preserve every field returned by the backend
    ...data,

    // Scan ID
    _id: data.scanId || data._id,

    // Product information
    product: {
      ...product,

      name:
        product.name ||
        data.productName ||
        'Unknown product',

      brand: product.brand || data.brand || '',

      image: product.image || data.imageUrl || null,

      ingredients,

      // Product label information from Open Food Facts
      productAnalysis:
        product.productAnalysis ||
        data.productAnalysis ||
        {
          allergens: [],
          ingredientAnalysisTags: [],
          additives: [],
        },
    },

    // Legacy frontend compatibility
    productName:
      product.name ||
      data.productName ||
      'Unknown product',

    brand: product.brand || data.brand || '',

    imageUrl: product.image || data.imageUrl || null,

    barcode: data.barcode || null,

    verdict: verdict.toLowerCase(),

    verdictSummary:
      data.aiAnalysis?.summary ||
      data.summary ||
      '',

    // Preserve raw numeric nutrition values.
    // ScanResult.jsx uses keys such as energyKcal100g.
    nutrition,

    // Preserve complete AI response
    aiAnalysis: data.aiAnalysis || null,

    // Ingredient list
    ingredients,

    // New AI architecture does not use legacy rule warnings
    conflictingIngredients: [],

    unmatchedIngredients: [],

    // Metadata
    quantity: product.quantity || null,

    scannedAt:
      data.createdAt ||
      new Date().toISOString(),

    isSaved: data.isSaved || false,

    // Accurate disclaimer
    disclaimer:
      'FoodLens provides an AI-assisted product assessment based on available ingredient, label and nutrition information. Product data may be incomplete or inaccurate. This is not medical advice and does not certify FSSAI compliance.',
  };
}

/**
 * Normalize a scan history item.
 * Keep AI analysis, nutrition and product information
 * if the backend includes them in the history response.
 */
function normalizeHistoryItem(scan) {
  const product = scan.product || {};

  return {
    ...scan,

    product: {
      ...product,
      productAnalysis:
        product.productAnalysis ||
        scan.productAnalysis ||
        {},
    },

    productName:
      product.name ||
      scan.productName ||
      scan.ingredients?.slice(0, 2).join(', ') ||
      'Manual scan',

    brand: product.brand || scan.brand || '',

    imageUrl: product.image || null,

    verdict: (
      scan.overallVerdict ||
      scan.verdict ||
      scan.aiAnalysis?.personalizedAssessment?.status ||
      'UNVERIFIED'
    ).toLowerCase(),

    scannedAt: scan.createdAt || scan.scannedAt,

    ingredients:
      product.ingredients ||
      scan.ingredients ||
      [],

    nutrition: scan.nutrition || {},

    aiAnalysis: scan.aiAnalysis || null,
  };
}

export const scanService = {
  /**
   * Barcode scanning
   */
  async scanBarcode(barcode) {


    if (USE_MOCK) {
      await delay(1200);

      return normalizeScanResult({
        ...MOCK_SCAN_RESULT,
        barcode,
        scanId: 'scan-' + Date.now(),
      });
    }

    try {
      console.log("SCAN SERVICE RECEIVED:", barcode);
console.log("SCAN SERVICE TYPE:", typeof barcode);


      const { data } = await api.post('/scan/barcode', {
        barcode,
      });

      return normalizeScanResult(data);
    } catch (err) {
  console.error('========== BARCODE SCAN ERROR ==========');
  console.error('Barcode:', barcode);
  console.error('Error message:', err.message);
  console.error('Error code:', err.code);
  console.error('Request URL:', err.config?.baseURL + err.config?.url);
  console.error('Request data:', err.config?.data);
  console.error('HTTP status:', err.response?.status);
  console.error('Backend response:', err.response?.data);
  console.error('========================================');

  if (!err.response) {
    throw {
      message: err.message || 'Backend server is unreachable.',
    };
  }

  throw {
    message:
      err.response?.data?.message ||
      'Something went wrong.',
  };
}
  },

  /**
   * OCR image scanning
   * FormData key must be "image".
   */
  

async scanIngredients(formData) {
  if (USE_MOCK) {
    await delay(1500);

    return normalizeScanResult({
      ...MOCK_SCAN_RESULT,
      scanId: 'scan-' + Date.now(),
    });
  }

  try {
    console.log('OCR SCAN STARTED');
console.log('OCR FILE:', formData.get('image'));
console.log('OCR FORMDATA:', [...formData.entries()]);

const { data } = await api.post('/scan/ocr', formData, {
  timeout: 90000,
});

    console.log('OCR SCAN SUCCESS:', data);

    return normalizeScanResult(data);

  } catch (err) {
    console.error('========== OCR SCAN ERROR ==========');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('Status:', err.response?.status);
    console.error('Backend response:', err.response?.data);
    console.error('Request URL:', err.config?.baseURL + err.config?.url);
    console.error('====================================');

    throw {
      message:
        err.response?.data?.message ||
        (err.code === 'ECONNABORTED'
          ? 'Ingredient analysis is taking longer than expected. Please check Scan History before trying again.'
          : 'Could not scan the ingredient image. Please try again.'),
    };
  }
},


  /**
   * Manual ingredient scanning
   */
  async scanManual(ingredients) {
    if (USE_MOCK) {
      await delay(1200);

      return normalizeScanResult({
        ...MOCK_SCAN_RESULT,
        scanId: 'scan-' + Date.now(),
      });
    }

    try {
      const payload = Array.isArray(ingredients)
        ? { ingredients }
        : { ingredients: [ingredients] };

      const { data } = await api.post(
        '/scan/ingredients',
        payload
      );

      return normalizeScanResult(data);
    } catch (err) {
      console.log('MANUAL SCAN ERROR:', err.response?.data);

      throw {
        message:
          err.response?.data?.message ||
          'Could not analyze the ingredients.',
      };
    }
  },

  /**
   * Get a single scan by ID.
   */
  async getScanById(id) {
    if (USE_MOCK) {
      await delay(400);

      return normalizeScanResult(MOCK_SCAN_RESULT);
    }

    try {
      const { data } = await api.get(`/scan/${id}`);

      const scan = data.scan || data.data?.scan || data.data || data;

      return normalizeScanResult(scan);
    } catch (err) {
      console.log('GET SCAN ERROR:', err.response?.data);

      throw {
        message:
          err.response?.data?.message ||
          'Could not load scan result.',
      };
    }
  },

  /**
   * Save or unsave a scan.
   */
  async saveScan(id, isSaved = true) {
    if (USE_MOCK) {
      await delay(300);

      return {
        success: true,
      };
    }

    const { data } = await api.patch(
      `/scans/history/${id}/save`,
      { isSaved }
    );

    return data;
  },

  /**
   * Delete a scan.
   */
  async deleteScan(id) {
    if (USE_MOCK) {
      await delay(300);

      return {
        success: true,
      };
    }

    const { data } = await api.delete(
      `/scans/history/${id}`
    );

    return data;
  },

  /**
   * Report an incorrect scan result.
   */
  async reportScan(
    id,
    reportType,
    description = ''
  ) {
    if (USE_MOCK) {
      await delay(400);

      return {
        success: true,
      };
    }

    const { data } = await api.post(
      `/scans/history/${id}/report`,
      {
        reportType,
        description,
      }
    );

    return data;
  },

  /**
   * Get scan history.
   */
  async getHistory(params = {}) {
    if (USE_MOCK) {
      await delay(500);

      return {
        scans: [],
        total: 0,
        pagination: {
          totalPages: 1,
        },
      };
    }

    const { data } = await api.get(
      '/scan/history',
      { params }
    );

    return {
      ...data,

      scans: (data.scans || []).map(
        normalizeHistoryItem
      ),
    };
  },
};
