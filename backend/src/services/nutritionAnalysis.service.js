/**
 * Analyzes nutrition values against health conditions and returns relevant warnings.
 *
 * @param {Object} nutrition         – nutrition object (fields may be null if data is missing)
 * @param {string[]} healthConditions – array of condition strings, e.g. ["diabetes", "high_bp"]
 * @returns {{ warnings: Array, missingFields: string[] }}
 */
export function analyzeNutrition(nutrition = {}, healthConditions = []) {
  const warnings = [];
  const missingFields = [];

  const conditions = (healthConditions || []).map((c) => c.toLowerCase().trim());

  // Helper: check if a value is present (not null/undefined)
  const hasValue = (v) => v !== null && v !== undefined && !isNaN(Number(v));

  // Track which fields are missing
  const trackedFields = [
    "energyKcal100g",
    "fat100g",
    "saturatedFat100g",
    "carbohydrates100g",
    "sugars100g",
    "proteins100g",
    "salt100g",
    "sodium100g",
  ];

  for (const field of trackedFields) {
    if (!hasValue(nutrition[field])) {
      missingFields.push(field);
    }
  }

  // ── DIABETES RULES ──────────────────────────────────────────────
  if (conditions.includes("diabetes")) {
    // Rule: sugars100g > 15g
    if (hasValue(nutrition.sugars100g)) {
      const val = Number(nutrition.sugars100g);
      if (val > 15) {
        warnings.push({
          field: "sugars100g",
          value: val,
          threshold: 15,
          unit: "g",
          condition: "diabetes",
          severity: "caution",
          message: {
            en: `High sugar content (${val}g per 100g). Consider your blood glucose management.`,
          },
        });
      }
    }

    // Rule: carbohydrates100g > 50g
    if (hasValue(nutrition.carbohydrates100g)) {
      const val = Number(nutrition.carbohydrates100g);
      if (val > 50) {
        warnings.push({
          field: "carbohydrates100g",
          value: val,
          threshold: 50,
          unit: "g",
          condition: "diabetes",
          severity: "caution",
          message: {
            en: `High carbohydrate content (${val}g per 100g). Consider your blood glucose management.`,
          },
        });
      }
    }
  }

  // ── HIGH BLOOD PRESSURE RULES ────────────────────────────────────
  if (conditions.includes("high_bp")) {
    // Prefer sodium100g (stored in grams by OFF, display in mg)
    if (hasValue(nutrition.sodium100g)) {
      const sodiumG = Number(nutrition.sodium100g);
      const sodiumMg = sodiumG * 1000;
      if (sodiumMg > 400) {
        warnings.push({
          field: "sodium100g",
          value: sodiumMg,
          threshold: 400,
          unit: "mg",
          condition: "high_bp",
          severity: "caution",
          message: {
            en: `High sodium content (${Math.round(sodiumMg)}mg per 100g). Consider your blood pressure management.`,
          },
        });
      }
    } else if (hasValue(nutrition.salt100g)) {
      // Fallback to salt if sodium not present
      const saltG = Number(nutrition.salt100g);
      if (saltG > 1.0) {
        warnings.push({
          field: "salt100g",
          value: saltG,
          threshold: 1.0,
          unit: "g",
          condition: "high_bp",
          severity: "caution",
          message: {
            en: `High salt content (${saltG}g per 100g). Consider your blood pressure management.`,
          },
        });
      }
    }
  }

  return { warnings, missingFields };
}
