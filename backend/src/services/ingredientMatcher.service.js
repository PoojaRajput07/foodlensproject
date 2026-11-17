import { normalizeIngredient } from "../utils/normalizeIngredient.js";
import { Ingredient } from "../models/ingredient.model.js";

/**
 * Matches an array of ingredient name strings against the MongoDB ingredient database.
 *
 * @param {string[]} ingredientNames  – raw or pre-normalized ingredient names
 * @returns {Promise<{
 *   normalizedNames: string[],
 *   foundIngredients: import("mongoose").Document[],
 *   matchedIngredients: { name: string, slug: string }[],
 *   unmatchedIngredients: string[]
 * }>}
 */
export async function matchIngredients(ingredientNames = []) {
  if (!ingredientNames.length) {
    return {
      normalizedNames: [],
      foundIngredients: [],
      matchedIngredients: [],
      unmatchedIngredients: [],
    };
  }

  // Normalize and deduplicate
  const normalizedNames = [
    ...new Set(ingredientNames.map((n) => normalizeIngredient(n)).filter(Boolean)),
  ];

  // Build name.en regex conditions – case-insensitive exact matches (anchored)
  const nameRegexConditions = normalizedNames.map((n) => ({
    "name.en": { $regex: `^${escapeRegex(n)}$`, $options: "i" },
  }));

  const query = {
    $or: [
      { slug: { $in: normalizedNames } },
      { aliases: { $in: normalizedNames } },
      { insNumber: { $in: normalizedNames } },
      ...nameRegexConditions,
    ],
  };

  const foundIngredients = await Ingredient.find(query).lean();

  // Build a set of normalized tokens that were matched
  const matchedTokens = new Set();

  for (const ing of foundIngredients) {
    const ingSlug = ing.slug?.toLowerCase();
    const ingNameEn = ing.name?.en?.toLowerCase();
    const ingAliases = (ing.aliases || []).map((a) => a.toLowerCase());
    const ingIns = ing.insNumber?.toLowerCase();

    for (const token of normalizedNames) {
      if (
        (ingSlug && ingSlug === token) ||
        (ingNameEn && ingNameEn === token) ||
        ingAliases.includes(token) ||
        (ingIns && ingIns === token)
      ) {
        matchedTokens.add(token);
      }
    }
  }

  const matchedIngredients = foundIngredients.map((ing) => ({
    name: ing.name?.en ?? ing.slug,
    slug: ing.slug,
    _id: ing._id,
    category: ing.category,
    fssaiStatus: ing.fssaiStatus,
  }));

  const unmatchedIngredients = normalizedNames.filter(
    (token) => !matchedTokens.has(token)
  );

  return {
    normalizedNames,
    foundIngredients,
    matchedIngredients,
    unmatchedIngredients,
  };
}

/** Escapes special regex characters in a string */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
