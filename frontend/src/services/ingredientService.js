// src/services/ingredientService.js
import api, { USE_MOCK } from './api.js';
import { MOCK_INGREDIENTS } from './mockAdapter.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Normalizes a backend ingredient to the shape the frontend expects.
 * Backend: { name: { en, hi }, slug, aliases, insNumber, category, fssaiStatus, explanation, ... }
 * Frontend expects: { _id, name (string), insNumber, category, fssaiStatus, description, ... }
 */
function normalizeIngredient(ing) {
  return {
    _id: ing._id,
    // Use slug as the identifier for detail page navigation
    slug: ing.slug,
    name: ing.name?.en ?? ing.slug ?? '',
    nameHi: ing.name?.hi ?? null,
    insNumber: ing.insNumber ?? '',
    category: ing.category ?? '',
    fssaiStatus: ing.fssaiStatus ?? '',
    description: ing.explanation?.en ?? ing.explanation ?? '',
    whyUsed: ing.whyUsed?.en ?? ing.whyUsed ?? '',
    whoShouldBeCareful: ing.whoShouldBeCareful?.en ?? ing.whoShouldBeCareful ?? '',
    sources: ing.sources ?? [],
    verified: ing.verified ?? false,
    aliases: ing.aliases ?? [],
  };
}

export const ingredientService = {
  async getIngredients({ category = '', search = '', page = 1, limit = 20, fssaiStatus = '' } = {}) {
    if (USE_MOCK) {
      await delay(400);
      let results = [...MOCK_INGREDIENTS];
      if (category) results = results.filter((i) => i.category === category);
      if (search) {
        const q = search.toLowerCase();
        results = results.filter(
          (i) => i.name.toLowerCase().includes(q) || i.insNumber.toLowerCase().includes(q)
        );
      }
      const total = results.length;
      const start = (page - 1) * limit;
      return {
        ingredients: results.slice(start, start + limit),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }

    // Backend: GET /ingredients?q=&category=&fssaiStatus=&page=&limit=
    const params = { page, limit };
    if (search) params.q = search;
    if (category) params.category = category;
    if (fssaiStatus) params.fssaiStatus = fssaiStatus;

    const { data } = await api.get('/ingredients', { params });

    return {
      ingredients: (data.ingredients || []).map(normalizeIngredient),
      total: data.total ?? 0,
      page: data.page ?? page,
      totalPages: data.totalPages ?? 1,
    };
  },

  /**
   * Get ingredient by slug (backend uses slug, not MongoDB _id).
   * @param {string} slug
   */
  async getIngredientBySlug(slug) {
    if (USE_MOCK) {
      await delay(300);
      const found = MOCK_INGREDIENTS.find((i) => i._id === slug || i.slug === slug);
      if (!found) throw { message: 'Ingredient not found' };
      return found;
    }
    const { data } = await api.get(`/ingredients/${slug}`);
    return normalizeIngredient(data.ingredient || data);
  },

  /** @deprecated use getIngredientBySlug */
  async getIngredientById(slugOrId) {
    return this.getIngredientBySlug(slugOrId);
  },

  async searchIngredients(query) {
    if (USE_MOCK) {
      await delay(300);
      const q = query.toLowerCase();
      return MOCK_INGREDIENTS.filter(
        (i) => i.name.toLowerCase().includes(q) || i.insNumber.toLowerCase().includes(q)
      );
    }
    const { data } = await api.get('/ingredients/search', { params: { q: query } });
    return (data.ingredients || []).map(normalizeIngredient);
  },
};
