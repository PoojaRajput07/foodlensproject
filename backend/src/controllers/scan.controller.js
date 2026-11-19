
import { ScanHistory } from "../models/ScanHistory.model.js";
import {
  extractTextFromImage,
} from "../services/ocr.service.js";
import {
  analyzeIngredientsWithAI,
} from "../services/groq.service.js";
import {
  extractIngredientNames,
} from "../utils/normalizeIngredient.js";
import fs from "fs";

// Allowed verdicts
const VALID_VERDICTS = [
  "AVOID",
  "CAUTION",
  "OK",
  "UNVERIFIED",
];

// Get verdict from Groq response
const getAIVerdict = (aiAnalysis) => {
  const verdict =
    aiAnalysis?.personalizedAssessment?.status ||
    aiAnalysis?.overallAssessment;

  return VALID_VERDICTS.includes(verdict)
    ? verdict
    : "UNVERIFIED";
};

// Validate user health profile
const getHealthProfile = (req, res) => {
  const healthProfile = req.user?.healthProfile;

  if (!healthProfile) {
    res.status(400).json({
      success: false,
      message: "Please complete your health profile first.",
    });

    return null;
  }

  return healthProfile;
};

// --------------------------------------------------
// MANUAL INGREDIENT SCAN
// --------------------------------------------------

export const scanFood = async (req, res) => {
  try {
    const { ingredients, nutrition = {} } = req.body;

    let ingredientList;

    if (typeof ingredients === "string") {
      ingredientList = ingredients.split(",");
    } else if (Array.isArray(ingredients)) {
      ingredientList = ingredients;
    } else {
      return res.status(400).json({
        success: false,
        message: "Ingredients must be a string or an array.",
      });
    }

    if (!ingredientList.every((item) => typeof item === "string")) {
      return res.status(400).json({
        success: false,
        message: "Each ingredient must be a string.",
      });
    }

    const normalizedIngredients = [
      ...new Set(
        ingredientList
          .map((item) => item.trim())
          .filter(Boolean)
      ),
    ];

    if (!normalizedIngredients.length) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one ingredient.",
      });
    }

    const healthProfile = getHealthProfile(req, res);

    if (!healthProfile) return;

    // Groq AI analysis
    let aiAnalysis = null;

    try {
      aiAnalysis = await analyzeIngredientsWithAI({
        ingredients: normalizedIngredients,
        healthProfile,
        language: req.user?.language || "en",
        nutrition:
          nutrition && typeof nutrition === "object"
            ? nutrition
            : {},
        productAnalysis: {},
      });
    } catch (aiError) {
      console.error(
        "Groq manual scan failed:",
        aiError.message
      );
    }

    const overallVerdict = getAIVerdict(aiAnalysis);

    // Save scan history
    const savedScan = await ScanHistory.create({
      user: req.user._id,
      scanType: "manual",
      ingredients: normalizedIngredients,
      ingredientsText: normalizedIngredients.join(", "),
      overallVerdict,
      nutrition:
        nutrition && typeof nutrition === "object"
          ? nutrition
          : {},
      aiAnalysis,
    });

    return res.status(200).json({
      success: true,
      message: aiAnalysis
        ? "Ingredients analyzed successfully."
        : "Ingredients received, but AI analysis is currently unavailable.",
      scanId: savedScan._id,
      overallVerdict,
      ingredients: normalizedIngredients,
      nutrition,
      aiAnalysis,
    });
  } catch (error) {
    console.error("Manual scan error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to scan food ingredients.",
    });
  }
};

// --------------------------------------------------
// BARCODE SCAN
// --------------------------------------------------


export const scanBarcode = async (req, res) => {
  try {
    const { barcode } = req.body;

    // 1. Validate barcode
    if (
      typeof barcode !== "string" ||
      !/^\d{8,14}$/.test(barcode.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid barcode.",
      });
    }

    const cleanBarcode = barcode.trim();

    // 2. Get user's health profile
    const healthProfile = getHealthProfile(req, res);

    if (!healthProfile) return;

    // 3. Open Food Facts API v3 fields
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
     

    console.log("Fetching Open Food Facts product:", cleanBarcode);

    // 4. Fetch product
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "LabelSach/1.0 (food product scanner)",
      },
    });

    // 5. Parse response, including HTTP 404 responses
    let data;

    try {
      
      data = await response.json();
      console.log("OFF RESPONSE STATUS:", data.status);
console.log("OFF PRODUCT EXISTS:", Boolean(data.product));
console.log("OFF RESPONSE:", JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error("OFF response parsing failed:", parseError.message);

      return res.status(502).json({
        success: false,
        message: "Invalid response received from Open Food Facts.",
      });
    }

    // 6. Handle product not found
    if (response.status === 404 || data.status === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found in Open Food Facts. Try scanning the ingredient label instead.",
        barcode: cleanBarcode,
      });
    }

    // 7. Handle other HTTP errors
    if (!response.ok) {
      console.error("Open Food Facts API error:", {
        status: response.status,
        response: data,
      });

      return res.status(502).json({
        success: false,
        message: "Open Food Facts service is temporarily unavailable.",
        upstreamStatus: response.status,
      });
    }

    // 8. Validate product data
   if (!data.product) {
  console.error("Product not found:", data);

  return res.status(404).json({
    success: false,
    message: "Product not found in Open Food Facts.",
    barcode: cleanBarcode,
  });
}



    const product = data.product;

    console.log(
      "PRODUCT FOUND:",
      product.product_name || cleanBarcode
    );

    // 9. Extract ingredients
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

    const normalizedIngredients = [
      ...new Set(
        ingredientNames
          .map((item) => item.trim())
          .filter(Boolean)
      ),
    ];

    // 10. Extract nutrition
    const nutriments = product.nutriments || {};

    const nutrition = {
      energyKcal100g:
        nutriments["energy-kcal_100g"] ?? null,
      fat100g:
        nutriments.fat_100g ?? null,
      saturatedFat100g:
        nutriments["saturated-fat_100g"] ?? null,
      carbohydrates100g:
        nutriments.carbohydrates_100g ?? null,
      sugars100g:
        nutriments.sugars_100g ?? null,
      proteins100g:
        nutriments.proteins_100g ?? null,
      salt100g:
        nutriments.salt_100g ?? null,
      sodium100g:
        nutriments.sodium_100g ?? null,
    };

    // 11. Extract additional product information
    const productAnalysis = {
      allergens: product.allergens_tags || [],
      ingredientAnalysisTags:
        product.ingredients_analysis_tags || [],
      additives: product.additives_tags || [],
    };

    // 12. Product details
    const productDetails = {
      name: product.product_name || "Unknown product",
      brand: product.brands || "Unknown brand",
      image: product.image_url || null,
    };

    // 13. Product exists but ingredients are unavailable
    if (!normalizedIngredients.length) {
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
        message:
          "Product found, but ingredient information is unavailable.",
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

    // 14. Analyze product using Groq AI
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
      console.error(
        "Groq barcode analysis failed:",
        aiError.message
      );
    }

    // 15. Get personalized verdict
    const overallVerdict = getAIVerdict(aiAnalysis);

    // 16. Save scan history
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

    // 17. Send response
    return res.status(200).json({
      success: true,
      message: aiAnalysis
        ? "Product scanned and analyzed successfully."
        : "Product found, but AI analysis is currently unavailable.",
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

    if (
      error.name === "TimeoutError" ||
      error.name === "AbortError"
    ) {
      return res.status(504).json({
        success: false,
        message: "Open Food Facts request timed out. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to scan barcode right now.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};


// --------------------------------------------------
// OCR INGREDIENT IMAGE SCAN
// --------------------------------------------------

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

    const healthProfile = getHealthProfile(req, res);

    if (!healthProfile) return;

    // Extract text using OCR
    const rawText = await extractTextFromImage(req.file.path);

    if (!rawText?.trim()) {
      return res.status(422).json({
        success: false,
        message: "Could not extract text. Try a clearer image.",
      });
    }

    // Extract ingredients from OCR text
    const ingredientNames = extractIngredientNames(rawText);

    if (!ingredientNames?.length) {
      return res.status(422).json({
        success: false,
        message: "No recognisable ingredients found.",
        extractedText: rawText.slice(0, 500),
      });
    }

    // Analyze directly using Groq
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
      console.error(
        "Groq OCR analysis failed:",
        aiError.message
      );
    }

    const overallVerdict = getAIVerdict(aiAnalysis);

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
      message: aiAnalysis
        ? "Ingredient image analyzed successfully."
        : "Ingredients extracted, but AI analysis is currently unavailable.",
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
