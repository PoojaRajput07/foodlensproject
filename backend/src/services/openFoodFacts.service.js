import { normalizeIngredient } from "../utils/normalizeIngredient.js";

const OFF_API_BASE = "https://world.openfoodfacts.org/api/v3/product";
const OFF_FIELDS =
  "code,product_name,brands,quantity,image_url,ingredients_text,ingredients,allergens_tags,traces_tags,nutriments,nutrition_grades";
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Fetches and normalizes a product from the Open Food Facts API by barcode.
 *
 * @param {string} barcode
 * @returns {Promise<Object>} normalized product object
 * @throws {{ code: "PRODUCT_NOT_FOUND" | "TIMEOUT" | "API_ERROR", status?: number }}
 */
export async function fetchProductByBarcode(barcode) {
  const url = `${OFF_API_BASE}/${encodeURIComponent(barcode)}.json?fields=${OFF_FIELDS}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      throw { code: "TIMEOUT" };
    }
    throw { code: "API_ERROR", status: null, originalError: err.message };
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw { code: "API_ERROR", status: response.status };
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw { code: "API_ERROR", status: response.status };
  }

  // Log only minimal info – never dump the full payload
  console.log(`[OpenFoodFacts] barcode=${barcode} status=${data?.status}`);

  if (data?.status !== "success" || !data?.product) {
    throw { code: "PRODUCT_NOT_FOUND" };
  }

  const p = data.product;
  const n = p.nutriments ?? {};

  // Build normalized ingredients list from structured ingredients array
  const ingredients = Array.isArray(p.ingredients)
    ? p.ingredients
        .map((i) => normalizeIngredient(i?.text ?? ""))
        .filter(Boolean)
    : [];

  const allergenTags = Array.isArray(p.allergens_tags)
    ? p.allergens_tags.map((t) => t.toLowerCase())
    : [];

  const traceTags = Array.isArray(p.traces_tags)
    ? p.traces_tags.map((t) => t.toLowerCase())
    : [];

  return {
    barcode: String(p.code ?? barcode),
    name: p.product_name ?? null,
    brand: p.brands ?? null,
    quantity: p.quantity ?? null,
    image: p.image_url ?? null,
    ingredientsText: p.ingredients_text ?? null,
    ingredients,
    allergenTags,
    traceTags,
    nutrition: {
      energyKcal100g:     n["energy-kcal_100g"]     ?? null,
      fat100g:            n["fat_100g"]              ?? null,
      saturatedFat100g:   n["saturated-fat_100g"]    ?? null,
      carbohydrates100g:  n["carbohydrates_100g"]    ?? null,
      sugars100g:         n["sugars_100g"]           ?? null,
      proteins100g:       n["proteins_100g"]         ?? null,
      salt100g:           n["salt_100g"]             ?? null,
      sodium100g:         n["sodium_100g"]           ?? null,
    },
    source: {
      name: "Open Food Facts",
      url: "https://world.openfoodfacts.org/",
    },
  };
}
