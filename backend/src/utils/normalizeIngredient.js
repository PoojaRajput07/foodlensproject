
/**
 * Normalizes a single ingredient name.
 * Preserves useful information such as E-numbers and INS numbers.
 */
export function normalizeIngredient(name) {
  if (!name || typeof name !== "string") return "";

  let result = name.toLowerCase().trim();

  // Remove common label prefixes
  result = result
    .replace(/^ingredients?\s*:\s*/i, "")
    .replace(/^contains\s*:\s*/i, "")
    .replace(/^made with\s+/i, "")
    .replace(/^prepared with\s+/i, "");

  // Normalize whitespace
  result = result.replace(/\s+/g, " ").trim();

  // Remove unnecessary leading/trailing punctuation
  result = result.replace(/^[.,;*:\s]+/, "");
  result = result.replace(/[.,;*:\s]+$/, "");


  

  return result;
}


/**
 * Converts ingredient names into English canonical names
 * using the Open Food Facts multilingual taxonomy.
 *
 * Unknown or unsupported ingredients retain their original names.
 */
export async function canonicalizeIngredients(names, language = "en") {
  const uniqueNames = [...new Set(names.map(normalizeIngredient).filter(Boolean))];

  if (!uniqueNames.length) return [];

  try {
    const params = new URLSearchParams({
      tagtype: "ingredients",
      local_tags_list: uniqueNames.join(","),
      lc: language || "en",
    });

    const url = `https://world.openfoodfacts.org/api/v3/taxonomy_canonicalize_tags?${params}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent": "LabelSach/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Taxonomy API error: ${response.status}`);
    }

    const data = await response.json();

    const canonicalTags = data.canonical_tags_list
      ? data.canonical_tags_list.split(",")
      : [];

    return uniqueNames.map((originalName, index) => {
      const canonicalTag = canonicalTags[index]?.trim();

      // Only use a recognized English canonical tag.
      if (canonicalTag?.startsWith("en:")) {
        return {
          originalName,
          canonicalName: canonicalTag
            .slice(3)
            .replace(/-/g, " "),
          canonicalId: canonicalTag,
          identified: true,
        };
      }

      return {
        originalName,
        canonicalName: originalName,
        canonicalId: null,
        identified: false,
      };
    });
  } catch (error) {
    console.error("Ingredient canonicalization failed:", error.message);

    // API failure must not stop scanning.
    return uniqueNames.map((originalName) => ({
      originalName,
      canonicalName: originalName,
      canonicalId: null,
      identified: false,
    }));
  }
}


/**
 * Splits raw ingredient text into normalized unique names.
 */



export function extractIngredientNames(text) {
  if (!text || typeof text !== "string") return [];

  let ingredientText = text;

  // Extract only the ingredients section.
  // Stop before allergen declarations, even without a colon.
  const sectionMatch = text.match(
    /INGREDIENTS\s*:?\s*([\s\S]*?)(?=\bALLERGEN INFORMATION\b|\bALLERGENS?\b|\bCONTAINS\b|\bMAY CONTAIN\b|\bNUTRITION\b|$)/i
  );

  if (sectionMatch) {
    ingredientText = sectionMatch[1];
  }

  // Remove explanatory label notes
  ingredientText = ingredientText.replace(
    /\(?numbers in brackets[\s\S]*$/i,
    ""
  );

  ingredientText = ingredientText
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Split commas only outside brackets and parentheses.
  const parts = [];
  let current = "";
  let squareDepth = 0;
  let roundDepth = 0;

  for (const char of ingredientText) {
    if (char === "[") squareDepth++;
    if (char === "]") squareDepth = Math.max(0, squareDepth - 1);
    if (char === "(") roundDepth++;
    if (char === ")") roundDepth = Math.max(0, roundDepth - 1);

    if (
      (char === "," || char === ";") &&
      squareDepth === 0 &&
      roundDepth === 0
    ) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) parts.push(current);

  const normalized = parts
    .map(part => normalizeIngredient(part))
    .filter(Boolean);

  return [...new Set(normalized)];
}


