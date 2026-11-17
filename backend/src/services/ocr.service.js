/**
 * OCR Service for Label Sach
 *
 * OCR_PROVIDER=none  → returns null (feature not configured)
 *
 * To add a real OCR provider in future, set OCR_PROVIDER=google|azure|tesseract
 * and implement the corresponding handler below.
 */

/**
 * Extract ingredient text from an image file.
 *
 * @param {string} filePath  – absolute path to the uploaded image
 * @returns {Promise<string|null>}  – extracted raw text, or null if unavailable
 */
export async function extractTextFromImage(filePath) {
  const provider = (process.env.OCR_PROVIDER || "none").toLowerCase();

  if (provider === "none" || !provider) {
    return null;
  }

  // ── Future providers ──────────────────────────────────────────────
  // if (provider === "google") { return googleVision(filePath); }
  // if (provider === "azure")  { return azureComputerVision(filePath); }

  throw new Error(`Unsupported OCR_PROVIDER: ${provider}`);
}

/**
 * Returns whether OCR is currently configured and available.
 * @returns {boolean}
 */
export function isOcrAvailable() {
  const provider = (process.env.OCR_PROVIDER || "none").toLowerCase();
  return provider !== "none" && provider !== "";
}
