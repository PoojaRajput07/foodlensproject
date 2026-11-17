/**
 * Normalizes a single ingredient name string.
 * @param {string} name
 * @returns {string}
 */
export function normalizeIngredient(name) {
  if (!name || typeof name !== "string") return "";

  let result = name.toLowerCase().trim();

  // Strip bracketed content: (INS 102), (E211), (permitted), [...]
  result = result.replace(/\(.*?\)/g, "").replace(/\[.*?\]/g, "");

  // Strip common prefixes (case already lowercased)
  result = result
    .replace(/^contains\s*:\s*/i, "")
    .replace(/^made with\s+/i, "")
    .replace(/^prepared with\s+/i, "");

  // Remove leading/trailing punctuation: . , ; *
  result = result.replace(/^[.,;*\s]+/, "").replace(/[.,;*\s]+$/, "");

  // Collapse multiple spaces
  result = result.replace(/\s{2,}/g, " ").trim();

  return result;
}

/**
 * Splits raw ingredients text (comma/semicolon separated) into normalized unique names.
 * @param {string} text
 * @returns {string[]}
 */
export function extractIngredientNames(text) {
  if (!text || typeof text !== "string") return [];

  const parts = text.split(/[,;]+/);
  const normalized = parts.map((p) => normalizeIngredient(p));
  const filtered = normalized.filter((n) => n.length > 0);

  // Return unique values preserving order
  return [...new Set(filtered)];
}
