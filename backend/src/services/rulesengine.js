
import { Rule } from "../models/rules.model.js";

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase();

export const evaluateIngredients = async ({
  ingredientIds = [],
  healthProfile = {},
}) => {
  if (!ingredientIds.length) {
    return [];
  }

  const rules = await Rule.find({
    ingredient: { $in: ingredientIds },
    verified: true,
  }).populate("ingredient");

  const allergies = (healthProfile.allergies || []).map(normalize);
  const conditions = (healthProfile.conditions || []).map(normalize);
  const diet = normalize(healthProfile.diet || "vegetarian");

  const results = [];

  for (const rule of rules) {
    const target = normalize(rule.target);
    let matched = false;

    if (
      rule.ruleType === "allergy" &&
      allergies.includes(target)
    ) {
      matched = true;
    }

    if (
      rule.ruleType === "condition" &&
      conditions.includes(target)
    ) {
      matched = true;
    }

    if (
      rule.ruleType === "diet" &&
      target === diet
    ) {
      matched = true;
    }

    if (matched) {
      results.push({
        ingredient: rule.ingredient?.name?.en,
        ruleType: rule.ruleType,
        target: rule.target,
        severity: rule.severity,
        message: rule.message,
        reason: rule.reason,
      });
    }
  }

  return results;
};
