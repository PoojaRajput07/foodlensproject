import { matchIngredients } from "./ingredientMatcher.service.js";
import { evaluateIngredients } from "./rulesengine.js";
import { analyzeNutrition } from "./nutritionAnalysis.service.js";
import { calculateVerdict, buildSummary } from "../utils/calculateVerdict.js";

/**
 * Maps Open Food Facts allergen tag prefixes to plain allergy names.
 * e.g. "en:milk" → "milk"
 */
const ALLERGEN_TAG_MAP = {
  "en:milk":          "milk",
  "en:dairy":         "milk",
  "en:gluten":        "gluten",
  "en:wheat":         "gluten",
  "en:peanuts":       "peanut",
  "en:peanut":        "peanut",
  "en:nuts":          "nuts",
  "en:tree-nuts":     "nuts",
  "en:eggs":          "egg",
  "en:egg":           "egg",
  "en:soy":           "soy",
  "en:soybeans":      "soy",
  "en:fish":          "fish",
  "en:shellfish":     "shellfish",
  "en:sesame":        "sesame",
  "en:mustard":       "mustard",
  "en:celery":        "celery",
  "en:sulphites":     "sulphites",
  "en:sulphur-dioxide-and-sulphites": "sulphites",
  "en:lupin":         "lupin",
  "en:molluscs":      "molluscs",
};

/**
 * Resolves an allergen tag to a plain allergy name.
 * Falls back to stripping the language prefix (e.g. "en:something" → "something").
 */
function tagToAllergen(tag) {
  const lower = tag.toLowerCase();
  if (ALLERGEN_TAG_MAP[lower]) return ALLERGEN_TAG_MAP[lower];
  // Generic strip: "en:milk-and-cream" → "milk-and-cream"
  const colonIdx = lower.indexOf(":");
  return colonIdx !== -1 ? lower.slice(colonIdx + 1) : lower;
}

/**
 * Core food analysis function.
 *
 * @param {{
 *   ingredients:  string[],
 *   allergenTags: string[],
 *   traceTags:    string[],
 *   nutrition:    Object,
 *   healthProfile: { allergies: string[], conditions: string[], diet: string }
 * }} params
 */
export async function analyzeFood({
  ingredients = [],
  allergenTags = [],
  traceTags = [],
  nutrition = {},
  healthProfile = {},
}) {
  const userAllergies = (healthProfile.allergies || []).map((a) =>
    a.toLowerCase().trim()
  );

  // ── 1 & 2: Match ingredients against DB ──────────────────────────
  const { foundIngredients, matchedIngredients, unmatchedIngredients } =
    await matchIngredients(ingredients);

  // ── 3: Rules-engine evaluation ───────────────────────────────────
  const ingredientIds = foundIngredients.map((ing) => ing._id);
  const ruleWarnings = await evaluateIngredients({ ingredientIds, healthProfile });

  // ── 4: Nutrition analysis ─────────────────────────────────────────
  const { warnings: nutritionWarnings } = analyzeNutrition(
    nutrition,
    healthProfile.conditions || []
  );

  // ── 5: Allergen tag checks ────────────────────────────────────────
  const allergenTagWarnings = [];

  if (userAllergies.length > 0) {
    // Direct allergen hits → AVOID
    for (const tag of allergenTags) {
      const allergen = tagToAllergen(tag);
      if (userAllergies.includes(allergen)) {
        allergenTagWarnings.push({
          type: "allergen_tag",
          tag,
          allergen,
          severity: "avoid",
          message: {
            en: `This product contains ${allergen}, which you are allergic to.`,
          },
        });
      }
    }

    // Trace (may contain) hits → CAUTION
    for (const tag of traceTags) {
      const allergen = tagToAllergen(tag);
      if (userAllergies.includes(allergen)) {
        // Only add if not already flagged as direct AVOID for same allergen
        const alreadyAvoided = allergenTagWarnings.some(
          (w) => w.allergen === allergen && w.severity === "avoid"
        );
        if (!alreadyAvoided) {
          allergenTagWarnings.push({
            type: "trace_tag",
            tag,
            allergen,
            severity: "caution",
            message: {
              en: `This product may contain traces of ${allergen}, which you are allergic to.`,
            },
          });
        }
      }
    }
  }

  // ── 6: Build enriched matched ingredients ────────────────────────
  const enrichedMatched = matchedIngredients.map((ing) => ({
    name: ing.name,
    slug: ing.slug,
    category: ing.category,
    fssaiStatus: ing.fssaiStatus,
    warnings: ruleWarnings.filter((w) => w.ingredient === ing.name),
  }));

  // ── 7 & 8: Combine all warnings & calculate verdict ──────────────
  const allWarnings = [...ruleWarnings, ...nutritionWarnings, ...allergenTagWarnings];

  const hasIngredientList = ingredients.length > 0;
  const nutritionAvailable = Object.values(nutrition).some(
    (v) => v !== null && v !== undefined
  );

  const overallVerdict = calculateVerdict(
    allWarnings,
    unmatchedIngredients,
    hasIngredientList,
    nutritionAvailable ? nutrition : null
  );

  const summary = buildSummary(overallVerdict, allWarnings, unmatchedIngredients);

  // ── 10: Return full result ────────────────────────────────────────
  return {
    overallVerdict,
    summary,
    matchedIngredients: enrichedMatched,
    unmatchedIngredients: unmatchedIngredients.map((name) => ({
      name,
      status: "UNKNOWN",
      reason: "This ingredient could not be verified in the ingredient database.",
    })),
    warnings: allWarnings,
    nutritionWarnings,
    dataCompleteness: {
      ingredientListAvailable: hasIngredientList,
      nutritionAvailable,
      unmatchedCount: unmatchedIngredients.length,
      allergenTagsAvailable: allergenTags.length > 0,
      status:
        unmatchedIngredients.length === 0 && hasIngredientList
          ? "complete"
          : "partial",
    },
  };
}
