
import { Ingredient } from "../models/ingredient.model.js";
import { ScanHistory } from "../models/ScanHistory.model.js";
import { evaluateIngredients } from "../services/rulesengine.js";
import { extractTextFromImage, isOcrAvailable } from "../services/ocr.service.js";
import { extractIngredientNames } from "../utils/normalizeIngredient.js";
import path from "path";
import fs from "fs";

// Calculate overall product verdict
const getOverallVerdict = (warnings, unmatchedIngredients) => {
  if (warnings.some((item) => item.severity === "avoid")) {
    return "AVOID";
  }

  if (warnings.some((item) => item.severity === "caution")) {
    return "CAUTION";
  }

  if (unmatchedIngredients.length > 0) {
    return "UNKNOWN";
  }

  if (warnings.length === 0 && unmatchedIngredients.length === 0) {
    return "OK";
  }

  return "UNKNOWN";
};

// Normalize and match ingredients with database
const matchIngredients = async (ingredientNames) => {
  const normalizedIngredients = [
    ...new Set(
      ingredientNames
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];

  const foundIngredients = await Ingredient.find({
    $or: [
      { slug: { $in: normalizedIngredients } },
      { aliases: { $in: normalizedIngredients } },
      { insNumber: { $in: normalizedIngredients } },
      { "name.en": { $in: normalizedIngredients } },
    ],
  });

  const matchedIngredients = foundIngredients.map((item) => ({
    name: item.name.en,
    slug: item.slug,
  }));

  const unmatchedIngredients = normalizedIngredients.filter(
    (input) =>
      !foundIngredients.some(
        (item) =>
          item.slug?.toLowerCase() === input ||
          item.aliases?.some(
            (alias) => alias.toLowerCase() === input
          ) ||
          item.insNumber?.toLowerCase() === input ||
          item.name.en?.toLowerCase() === input
      )
  );

  return {
    normalizedIngredients,
    foundIngredients,
    matchedIngredients,
    unmatchedIngredients,
  };
};

// Get warnings according to user's health profile
const getWarnings = async (foundIngredients, healthProfile) => {
  return evaluateIngredients({
    ingredientIds: foundIngredients.map((item) => item._id),
    healthProfile,
  });
};

// MANUAL INGREDIENT SCAN
export const scanFood = async (req, res) => {
  try {
    const { ingredients } = req.body;

    let ingredientList;

    if (typeof ingredients === "string") {
      ingredientList = ingredients.split(",");
    } else if (Array.isArray(ingredients)) {
      ingredientList = ingredients;
    } else {
      return res.status(400).json({
        success: false,
        message: "Ingredients must be a string or an array",
      });
    }

    if (!ingredientList.every((item) => typeof item === "string")) {
      return res.status(400).json({
        success: false,
        message: "Each ingredient must be a string",
      });
    }

    const ingredientNames = ingredientList
      .map((item) => item.trim())
      .filter(Boolean);

    if (ingredientNames.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one ingredient",
      });
    }

    const healthProfile = req.user?.healthProfile;

    if (!healthProfile) {
      return res.status(400).json({
        success: false,
        message: "Please complete your health profile first.",
      });
    }

    const {
      normalizedIngredients,
      foundIngredients,
      matchedIngredients,
      unmatchedIngredients,
    } = await matchIngredients(ingredientNames);

    const warnings = await getWarnings(foundIngredients, healthProfile);

    const overallVerdict = getOverallVerdict(
      warnings,
      unmatchedIngredients
    );

    const savedScan = await ScanHistory.create({
      user: req.user._id,
      scanType: "manual",
      ingredients: normalizedIngredients,
      ingredientsText: normalizedIngredients.join(", "),
      matchedIngredients,
      unmatchedIngredients,
      warnings,
      overallVerdict,
    });

    return res.status(200).json({
      success: true,
      message: "Ingredients scanned successfully",
      scanId: savedScan._id,
      overallVerdict,
      scannedIngredients: matchedIngredients,
      unmatchedIngredients,
      warnings,
    });
  } catch (error) {
    console.error("Food scan error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to scan food ingredients.",
    });
  }
};

// BARCODE SCAN
export const scanBarcode = async (req, res) => {
  try {
    const { barcode } = req.body;

    if (
      typeof barcode !== "string" ||
      !/^\d{8,14}$/.test(barcode.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid barcode.",
      });
    }

    const healthProfile = req.user?.healthProfile;

    if (!healthProfile) {
      return res.status(400).json({
        success: false,
        message: "Please complete your health profile first.",
      });
    }

    const cleanBarcode = barcode.trim();

    const url = `https://world.openfoodfacts.org/api/v3/product/${cleanBarcode}.json?fields=code,product_name,brands,ingredients_text,ingredients,image_url,nutriments`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: "Product service is temporarily unavailable.",
      });
    }

    
    const data = await response.json();

console.log("Barcode scan – barcode:", cleanBarcode, "| OFF status:", data.status);

if (data.status !== "success" || !data.product) {
  return res.status(404).json({
    success: false,
    message: "Product not found in Open Food Facts.",
    apiStatus: data.status,
    apiMessage: data.status_verbose || null,
  });
}

    

    const product = data.product;

    const ingredientsText = product.ingredients_text || "";

    const apiIngredients = (product.ingredients || [])
      .map((item) => item.text?.trim())
      .filter(Boolean);

    const ingredientNames = apiIngredients.length
      ? apiIngredients
      : ingredientsText.split(",").map((item) => item.trim()).filter(Boolean);

    if (ingredientNames.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Product found, but ingredient information is unavailable.",
        overallVerdict: "UNKNOWN",
        product: {
          name: product.product_name || "Unknown product",
          brand: product.brands || "Unknown brand",
          image: product.image_url || null,
          ingredientsText: null,
          ingredients: [],
        },
        matchedIngredients: [],
        unmatchedIngredients: [],
        warnings: [],
        nutrition: null,
      });
    }

    const {
      normalizedIngredients,
      foundIngredients,
      matchedIngredients,
      unmatchedIngredients,
    } = await matchIngredients(ingredientNames);

    const warnings = await getWarnings(foundIngredients, healthProfile);

    const overallVerdict = getOverallVerdict(
      warnings,
      unmatchedIngredients
    );

    const nutriments = product.nutriments || {};

    const nutrition = {
      energyKcal100g: nutriments["energy-kcal_100g"] ?? null,
      fat100g: nutriments.fat_100g ?? null,
      saturatedFat100g: nutriments["saturated-fat_100g"] ?? null,
      carbohydrates100g: nutriments.carbohydrates_100g ?? null,
      sugars100g: nutriments.sugars_100g ?? null,
      proteins100g: nutriments.proteins_100g ?? null,
      salt100g: nutriments.salt_100g ?? null,
      sodium100g: nutriments.sodium_100g ?? null,
    };

    const productDetails = {
      name: product.product_name || "Unknown product",
      brand: product.brands || "Unknown brand",
      image: product.image_url || null,
    };

    const savedScan = await ScanHistory.create({
      user: req.user._id,
      scanType: "barcode",
      barcode: data.code || cleanBarcode,
      product: productDetails,
      ingredientsText: ingredientsText || null,
      ingredients: normalizedIngredients,
      matchedIngredients,
      unmatchedIngredients,
      warnings,
      overallVerdict,
      nutrition,
    });

    return res.status(200).json({
      success: true,
      message: "Product scanned successfully",
      scanId: savedScan._id,
      barcode: data.code || cleanBarcode,
      overallVerdict,
      product: {
        ...productDetails,
        ingredientsText: ingredientsText || null,
        ingredients: normalizedIngredients,
      },
      matchedIngredients,
      unmatchedIngredients,
      warnings,
      nutrition,
    });
  } catch (error) {
    console.error("Barcode scan error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to scan barcode right now.",
    });
  }
};

// OCR IMAGE SCAN
export const scanOCR = async (req, res) => {
  // Clean up uploaded file at the end regardless of outcome
  const cleanup = () => {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
  };

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded. Send a multipart/form-data request with field 'image'.",
      });
    }

    if (!isOcrAvailable()) {
      cleanup();
      return res.status(503).json({
        success: false,
        message: "OCR feature is not configured on this server. Use manual ingredient entry instead.",
      });
    }

    const healthProfile = req.user?.healthProfile;
    if (!healthProfile) {
      cleanup();
      return res.status(400).json({
        success: false,
        message: "Please complete your health profile first.",
      });
    }

    const rawText = await extractTextFromImage(req.file.path);
    cleanup();

    if (!rawText || !rawText.trim()) {
      return res.status(422).json({
        success: false,
        message: "Could not extract any text from the image. Please try a clearer photo.",
      });
    }

    // Parse ingredient names from OCR text
    const ingredientNames = extractIngredientNames(rawText);

    if (ingredientNames.length === 0) {
      return res.status(422).json({
        success: false,
        message: "No recognisable ingredients found in the image text.",
        extractedText: rawText.slice(0, 300),
      });
    }

    const { normalizedIngredients, foundIngredients, matchedIngredients, unmatchedIngredients } =
      await matchIngredients(ingredientNames);

    const warnings = await getWarnings(foundIngredients, healthProfile);
    const overallVerdict = getOverallVerdict(warnings, unmatchedIngredients);

    const savedScan = await ScanHistory.create({
      user: req.user._id,
      scanType: "manual",
      ingredientsText: rawText.slice(0, 1000),
      ingredients: normalizedIngredients,
      matchedIngredients,
      unmatchedIngredients,
      warnings,
      overallVerdict,
    });

    return res.status(200).json({
      success: true,
      message: "Image scanned successfully",
      scanId: savedScan._id,
      extractedText: rawText.slice(0, 500),
      overallVerdict,
      scannedIngredients: matchedIngredients,
      unmatchedIngredients,
      warnings,
    });
  } catch (error) {
    cleanup();
    console.error("OCR scan error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to process image right now.",
    });
  }
};
