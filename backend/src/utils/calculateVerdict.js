/**
 * Calculates an overall safety verdict based on warnings and data completeness.
 *
 * Priority: AVOID > CAUTION > UNKNOWN > OK
 *
 * @param {Array}   warnings               – combined warning objects (each has .severity)
 * @param {string[]} unmatchedIngredients  – ingredient names that could not be matched
 * @param {boolean} hasIngredientList      – whether the product has an ingredient list
 * @param {Object|null} hasNutrition       – nutrition object; null means no data at all
 * @returns {"AVOID"|"CAUTION"|"UNKNOWN"|"OK"}
 */
export function calculateVerdict(
  warnings = [],
  unmatchedIngredients = [],
  hasIngredientList = false,
  hasNutrition = null
) {
  // Highest severity first
  if (warnings.some((w) => w.severity === "avoid")) return "AVOID";
  if (warnings.some((w) => w.severity === "caution")) return "CAUTION";

  // Data gaps push verdict to UNKNOWN
  if (unmatchedIngredients.length > 0 || !hasIngredientList) return "UNKNOWN";

  // If we have no nutrition at all, downgrade OK → UNKNOWN
  if (
    hasNutrition === null ||
    (typeof hasNutrition === "object" &&
      hasNutrition !== null &&
      Object.values(hasNutrition).every((v) => v === null || v === undefined))
  ) {
    return "UNKNOWN";
  }

  // All clear
  if (
    warnings.length === 0 &&
    unmatchedIngredients.length === 0 &&
    hasIngredientList
  ) {
    return "OK";
  }

  return "UNKNOWN";
}

/**
 * Builds a human-readable English summary string for the verdict.
 *
 * @param {"AVOID"|"CAUTION"|"UNKNOWN"|"OK"} overallVerdict
 * @param {Array}   warnings
 * @param {string[]} unmatchedIngredients
 * @returns {string}
 */
export function buildSummary(overallVerdict, warnings = [], unmatchedIngredients = []) {
  const avoidWarnings = warnings.filter((w) => w.severity === "avoid");
  const cautionWarnings = warnings.filter((w) => w.severity === "caution");

  switch (overallVerdict) {
    case "AVOID": {
      const reasons = avoidWarnings
        .map((w) => w.message?.en || w.message || "an allergen or prohibited ingredient")
        .slice(0, 3)
        .join("; ");
      return `This product should be AVOIDED. Reason(s): ${reasons}.`;
    }

    case "CAUTION": {
      const reasons = cautionWarnings
        .map((w) => w.message?.en || w.message || "a flagged ingredient")
        .slice(0, 3)
        .join("; ");
      return `Consume with CAUTION. This product contains ingredients that may be of concern: ${reasons}.`;
    }

    case "UNKNOWN": {
      const parts = [];
      if (!warnings.length && unmatchedIngredients.length > 0) {
        parts.push(
          `${unmatchedIngredients.length} ingredient(s) could not be verified in the database (${unmatchedIngredients.slice(0, 3).join(", ")}${unmatchedIngredients.length > 3 ? "…" : ""})`
        );
      }
      if (unmatchedIngredients.length === 0) {
        parts.push("incomplete product data");
      }
      return `The safety of this product is UNKNOWN due to ${parts.join(" and ")}. Review the label carefully.`;
    }

    case "OK":
      return "This product appears safe based on the available ingredient and nutrition data. No concerns were detected for your health profile.";

    default:
      return "Unable to determine the safety verdict for this product.";
  }
}
