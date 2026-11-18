// src/services/mockAdapter.js
// ============================================================
// ⚠️  MOCK ADAPTER — FOR FRONTEND DEVELOPMENT ONLY
// Set VITE_USE_MOCK=true in .env to enable.
// All data returned here is FAKE. Connect real backend
// by setting VITE_USE_MOCK=false.
// ============================================================

export const MOCK_USER = {
  _id: 'mock-user-001',
  name: 'Priya Sharma',
  email: 'priya@example.com',
  createdAt: '2024-01-15T10:30:00Z',
};

export const MOCK_PROFILE = {
  ...MOCK_USER,
  age: 28,
  gender: 'female',
  allergies: ['Milk', 'Gluten'],
  healthConditions: ['Diabetes'],
  dietPreference: 'Vegetarian',
  profileComplete: true,
};

export const MOCK_SCAN_HISTORY = [
  {
    _id: 'scan-001',
    productName: 'Maggi 2-Minute Noodles',
    brand: 'Nestlé',
    barcode: '8901030860140',
    verdict: 'avoid',
    scannedAt: '2024-11-15T14:22:00Z',
    saved: true,
  },
  {
    _id: 'scan-002',
    productName: 'Britannia Digestive Biscuits',
    brand: 'Britannia',
    barcode: '8901063123456',
    verdict: 'caution',
    scannedAt: '2024-11-14T09:10:00Z',
    saved: false,
  },
  {
    _id: 'scan-003',
    productName: 'Amul Butter',
    brand: 'Amul',
    barcode: '8901021000011',
    verdict: 'avoid',
    scannedAt: '2024-11-13T18:45:00Z',
    saved: false,
  },
  {
    _id: 'scan-004',
    productName: 'Tata Salt',
    brand: 'Tata Consumer Products',
    barcode: '8901275000012',
    verdict: 'ok',
    scannedAt: '2024-11-12T12:00:00Z',
    saved: true,
  },
  {
    _id: 'scan-005',
    productName: 'Parle-G Glucose Biscuits',
    brand: 'Parle',
    barcode: '8901305012345',
    verdict: 'caution',
    scannedAt: '2024-11-11T08:30:00Z',
    saved: false,
  },
];

export const MOCK_SCAN_RESULT = {
  _id: 'scan-001',
  productName: 'Maggi 2-Minute Noodles',
  brand: 'Nestlé',
  quantity: '70g',
  barcode: '8901030860140',
  imageUrl: null,
  verdict: 'avoid',
  verdictSummary: 'Contains Gluten and Milk — not suitable for your health profile.',
  conflictingIngredients: [
    {
      name: 'Wheat Flour',
      reason: 'Contains Gluten — flagged for your Gluten allergy.',
      verdict: 'avoid',
      source: 'FSSAI Allergen List',
    },
    {
      name: 'Skimmed Milk Powder',
      reason: 'Contains dairy — flagged for your Milk allergy.',
      verdict: 'avoid',
      source: 'FSSAI Allergen List',
    },
    {
      name: 'Sugar',
      reason: 'High sugar content — caution for Diabetes.',
      verdict: 'caution',
      source: 'ICMR Dietary Guidelines',
    },
  ],
  ingredients: [
    'Wheat Flour', 'Refined Palm Oil', 'Salt', 'Skimmed Milk Powder',
    'Spices and Condiments', 'Sugar', 'Onion Powder', 'Acidity Regulator (INS 330)',
    'Flavour Enhancer (INS 627, INS 631)', 'Colour (INS 150d)',
  ],
  nutrition: {
    servingSize: '70g',
    energy: '300 kcal',
    sugar: '1.8g',
    sodium: '890mg',
    fat: '11g',
    protein: '8g',
    carbohydrates: '45g',
  },
  disclaimer:
    'FoodLens provides ingredient analysis based on FSSAI data and published health guidelines. This is not medical advice. Always consult a healthcare professional for dietary decisions.',
  scannedAt: '2024-11-15T14:22:00Z',
};

export const MOCK_INGREDIENTS = [
  {
    _id: 'ing-001',
    name: 'Tartrazine',
    insNumber: 'INS 102',
    category: 'Colours',
    fssaiStatus: 'Permitted',
    description: 'A synthetic lemon yellow azo dye used as a food colouring.',
    whyUsed: 'Provides yellow colour to food products.',
    whoShouldBeCareful: 'People with aspirin sensitivity or attention disorders should limit intake.',
    sources: ['FSSAI Food Additive Regulations', 'EFSA Scientific Opinion'],
  },
  {
    _id: 'ing-002',
    name: 'Sodium Benzoate',
    insNumber: 'INS 211',
    category: 'Preservatives',
    fssaiStatus: 'Permitted',
    description: 'A widely used food preservative that inhibits microbial growth.',
    whyUsed: 'Extends shelf life of acidic foods and beverages.',
    whoShouldBeCareful: 'People with asthma or aspirin sensitivity. Avoid combining with ascorbic acid (Vitamin C).',
    sources: ['FSSAI Preservative Standards', 'WHO Food Additive Database'],
  },
  {
    _id: 'ing-003',
    name: 'Aspartame',
    insNumber: 'INS 951',
    category: 'Sweeteners',
    fssaiStatus: 'Permitted',
    description: 'An intense artificial sweetener approximately 200 times sweeter than sugar.',
    whyUsed: 'Reduces caloric content while maintaining sweetness.',
    whoShouldBeCareful: 'People with Phenylketonuria (PKU) must avoid. Contains phenylalanine.',
    sources: ['FSSAI Sweetener Regulations', 'FDA GRAS Database'],
  },
  {
    _id: 'ing-004',
    name: 'Lecithin',
    insNumber: 'INS 322',
    category: 'Emulsifiers',
    fssaiStatus: 'Permitted',
    description: 'A naturally occurring phospholipid found in egg yolks and soybeans.',
    whyUsed: 'Acts as an emulsifier to prevent separation of oil and water.',
    whoShouldBeCareful: 'People with soy allergy should check the source (soy vs. sunflower lecithin).',
    sources: ['FSSAI Emulsifier List', 'EFSA Assessment INS 322'],
  },
  {
    _id: 'ing-005',
    name: 'Diacetyl',
    insNumber: 'INS 365',
    category: 'Flavours',
    fssaiStatus: 'Permitted',
    description: 'A naturally occurring diketone giving buttery flavour.',
    whyUsed: 'Imparts butter-like taste in margarine and microwave popcorn.',
    whoShouldBeCareful: 'Occupational inhalation risk; dietary consumption is generally safe.',
    sources: ['FSSAI Flavour Regulations', 'NIOSH Safety Data'],
  },
  {
    _id: 'ing-006',
    name: 'Potassium Sorbate',
    insNumber: 'INS 202',
    category: 'Preservatives',
    fssaiStatus: 'Permitted',
    description: 'A potassium salt of sorbic acid used as a mould inhibitor.',
    whyUsed: 'Prevents growth of mould, yeast and fungi in food.',
    whoShouldBeCareful: 'Generally recognised as safe; rare contact dermatitis reported.',
    sources: ['FSSAI Preservative Standards', 'Codex Alimentarius GSFA'],
  },
];

export const MOCK_STATS = {
  totalScans: 24,
  avoid: 10,
  caution: 9,
  ok: 5,
};
