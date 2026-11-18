
import { Ingredient } from "../models/ingredient.model.js";
import { ScanHistory } from "../models/ScanHistory.model.js";
import { evaluateIngredients } from "../services/rulesengine.js";
import { extractTextFromImage, isOcrAvailable } from "../services/ocr.service.js";
import { analyzeIngredientsWithAI } from "../services/groq.service.js";
import fs from "fs";

import {
  extractIngredientNames,
  normalizeIngredient,
  canonicalizeIngredients,
} from "../utils/normalizeIngredient.js";

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

const getIngredientLookupTerms = (name) => {
  const normalized = normalizeIngredient(name);

  if (!normalized) return [];

  const terms = new Set([normalized]);

  // Extract content inside brackets, e.g. INS 322
  const bracketContents = normalized.match(/[([](.*?)[)\]]/g) || [];

  bracketContents.forEach((content) => {
    const cleaned = content.replace(/[()[\]]/g, "").trim();

    if (cleaned) {
      terms.add(cleaned);
    }
  });

  // Remove bracketed content to get the main ingredient name
  const withoutBrackets = normalized
    .replace(/\(.*?\)|\[.*?\]/g, "")
    .trim();

  if (withoutBrackets) {
    terms.add(withoutBrackets);
  }

  // Normalize E-number and INS number variations
  for (const term of [...terms]) {
    const match = term.match(/^(?:e|ins)\s*(\d+[a-z]?)$/i);

    if (match) {
      const number = match[1];

      terms.add(`e${number}`);
      terms.add(`ins ${number}`);
      terms.add(`ins${number}`);
    }
  }

  return [...terms];
};

const matchIngredients = async (ingredientNames) => {
  const normalizedIngredients = [
    ...new Set(
      ingredientNames
        .map(normalizeIngredient)
        .filter(Boolean)
    ),
  ];

  const lookupTerms = [
    ...new Set(
      normalizedIngredients.flatMap(getIngredientLookupTerms)
    ),
  ];

  const foundIngredients = await Ingredient.find({
    $or: [
      { slug: { $in: lookupTerms } },
      { aliases: { $in: lookupTerms } },
      { insNumber: { $in: lookupTerms } },
      { "name.en": { $in: lookupTerms } },
    ],
  });

  const matchedIngredients = [];
  const unmatchedIngredients = [];

  for (const originalName of normalizedIngredients) {
    const terms = getIngredientLookupTerms(originalName);

    const matched = foundIngredients.find((item) => {
      const searchableValues = [
        item.slug,
        item.name?.en,
        item.insNumber,
        ...(item.aliases || []),
      ]
        .filter(Boolean)
        .map(normalizeIngredient);

      return searchableValues.some((value) => terms.includes(value));
    });

    if (matched) {
      matchedIngredients.push({
        name: matched.name.en,
        slug: matched.slug,
      });
    } else {
      unmatchedIngredients.push(originalName);
    }
  }

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
  try {
  aiAnalysis = await analyzeIngredientsWithAI({
    ingredients: normalizedIngredients,
    healthProfile,
    language: req.user?.language || "en",
    nutrition,
  });
} catch (aiError) {
  console.error("Gemini analysis failed:", aiError.message);
}

    const overallVerdict = getOverallVerdict(
      warnings,
      unmatchedIngredients
    );

    let aiAnalysis = null;



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
      aiAnalysis,
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

    // Validate barcode
    if (
      typeof barcode !== "string" ||
      !/^\d{8,14}$/.test(barcode.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid barcode.",
      });
    }

    // Get user's health profile
    const healthProfile = req.user?.healthProfile;

    if (!healthProfile) {
      return res.status(400).json({
        success: false,
        message: "Please complete your health profile first.",
      });
    }

    const cleanBarcode = barcode.trim();

    // Fetch product from Open Food Facts
    const fields = [
      "code",
      "product_name",
      "brands",
      "ingredients_text",
      "ingredients",
      "ingredients_lc",
      "image_url",
      "nutriments",
      "allergens_tags",
      "ingredients_analysis_tags",
      "additives_tags",
    ].join(",");

    const url = `https://world.openfoodfacts.org/api/v3/product/${cleanBarcode}.json?fields=${fields}`;

    console.log("Fetching product:", url);

    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    });

    const data = await response.json();

    if (
      !response.ok ||
      !["success", "success_with_warnings"].includes(data.status) ||
      !data.product
    ) {
      return res.status(404).json({
        success: false,
        message: "Product not found in Open Food Facts.",
        barcode: cleanBarcode,
      });
    }

    const product = data.product;

    console.log("PRODUCT FOUND:", product.product_name);

    // Extract ingredients
    const ingredientsText = product.ingredients_text || "";

    const apiIngredients = (product.ingredients || [])
      .map((item) => item.text?.trim())
      .filter(Boolean);

    const ingredientNames = apiIngredients.length
      ? apiIngredients
      : ingredientsText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    // Normalize ingredient names without database matching
    const normalizedIngredients = [
      ...new Set(
        ingredientNames
          .map((item) => item.trim())
          .filter(Boolean)
      ),
    ];

    // Extract nutrition information
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

    // Extract additional Open Food Facts information
    const productAnalysis = {
      allergens: product.allergens_tags || [],
      ingredientAnalysisTags:
        product.ingredients_analysis_tags || [],
      additives: product.additives_tags || [],
    };

    // Product details
    const productDetails = {
      name: product.product_name || "Unknown product",
      brand: product.brands || "Unknown brand",
      image: product.image_url || null,
    };

    // If ingredients are unavailable
    if (normalizedIngredients.length === 0) {
      const savedScan = await ScanHistory.create({
        user: req.user._id,
        scanType: "barcode",
        barcode: data.code || cleanBarcode,
        product: productDetails,
        ingredientsText: ingredientsText || null,
        ingredients: [],
        overallVerdict: "UNVERIFIED",
        nutrition,
        aiAnalysis: null,
      });

      return res.status(200).json({
        success: true,
        message: "Product found, but ingredient information is unavailable.",
        scanId: savedScan._id,
        barcode: data.code || cleanBarcode,
        overallVerdict: "UNVERIFIED",
        product: {
          ...productDetails,
          ingredientsText: ingredientsText || null,
          ingredients: [],
          productAnalysis,
        },
        nutrition,
        aiAnalysis: null,
      });
    }

    // Analyze product using Groq AI
    let aiAnalysis = null;

    try {
      aiAnalysis = await analyzeIngredientsWithAI({
        ingredients: normalizedIngredients,
        healthProfile,
        language: req.user?.language || "en",
        nutrition,
        productAnalysis,
      });
    } catch (aiError) {
      console.error("Groq barcode analysis failed:", aiError.message);
    }

    // Get final verdict from AI assessment
    const overallVerdict =
      aiAnalysis?.personalizedAssessment?.status ||
      aiAnalysis?.overallAssessment ||
      "UNVERIFIED";

    // Save scan history
    const savedScan = await ScanHistory.create({
      user: req.user._id,
      scanType: "barcode",
      barcode: data.code || cleanBarcode,
      product: productDetails,
      ingredientsText: ingredientsText || null,
      ingredients: normalizedIngredients,
      overallVerdict,
      nutrition,
      aiAnalysis,
    });

    // Send response
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
        productAnalysis,
      },
      nutrition,
      aiAnalysis,
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
  const cleanup = () => {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
  };

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded.",
      });
    }

    const healthProfile = req.user?.healthProfile;

    if (!healthProfile) {
      return res.status(400).json({
        success: false,
        message: "Please complete your health profile first.",
      });
    }

    // Extract text using Tesseract OCR
    const rawText = await extractTextFromImage(req.file.path);

    if (!rawText?.trim()) {
      return res.status(422).json({
        success: false,
        message: "Could not extract text. Try a clearer image.",
      });
    }

    // Extract ingredient names from OCR text
    const ingredientNames = extractIngredientNames(rawText);

    if (!ingredientNames.length) {
      return res.status(422).json({
        success: false,
        message: "No recognisable ingredients found.",
        extractedText: rawText.slice(0, 500),
      });
    }

    // Send ingredients directly to Groq
    let aiAnalysis = null;

    try {
      aiAnalysis = await analyzeIngredientsWithAI({
        ingredients: ingredientNames,
        healthProfile,
        language: req.user?.language || "en",
        nutrition: {},
        productAnalysis: {},
      });
    } catch (aiError) {
      console.error("Groq OCR analysis failed:", aiError.message);
    }

    const overallVerdict =
      aiAnalysis?.personalizedAssessment?.status ||
      aiAnalysis?.overallAssessment ||
      "UNVERIFIED";

    // Save scan history
    const savedScan = await ScanHistory.create({
      user: req.user._id,
      scanType: "manual",
      ingredientsText: rawText.slice(0, 1000),
      ingredients: ingredientNames,
      overallVerdict,
      aiAnalysis,
    });

    return res.status(200).json({
      success: true,
      message: "Ingredients image analyzed successfully.",
      scanId: savedScan._id,
      overallVerdict,
      extractedText: rawText.slice(0, 1000),
      ingredients: ingredientNames,
      aiAnalysis,
    });

  } catch (error) {
    console.error("OCR scan error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process image right now.",
    });
  } finally {
    cleanup();
  }
};
