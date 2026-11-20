
import { ScanHistory } from "../models/ScanHistory.model.js";
import {
  extractTextFromImage,
} from "../services/ocr.service.js";
import {
  analyzeIngredientsWithAI,
  searchProductByBarcodeWithAI,
} from "../services/groq.service.js";
import {
  extractIngredientNames,
} from "../utils/normalizeIngredient.js";
import fs from "fs";


// Allowed verdicts


// Get verdict from Groq response

const getRetryAfterSeconds = (errorMessage = "") => {
  // Example: "Please try again in 12m32.112s"
  const match = errorMessage.match(
    /try again in\s+(?:(\d+)m)?([\d.]+)s/i
  );

  if (!match) return null;

  const minutes = Number(match[1] || 0);
  const seconds = Number(match[2] || 0);

  return Math.ceil(minutes * 60 + seconds);
};

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
    aiAnalysis?.overallAssessment ||
    "UNVERIFIED";

  const normalizedVerdict = String(verdict).trim().toUpperCase();

  return VALID_VERDICTS.includes(normalizedVerdict)
    ? normalizedVerdict
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



// Match Open Food Facts allergen tags with user allergies
const normalizeAllergen = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/^[a-z]{2,3}:/, "")
    .replace(/_/g, "-");

const ALLERGEN_ALIASES = {
  milk: ["milk"],
  peanut: ["peanut", "peanuts"],
  gluten: ["gluten"],
  soy: ["soy", "soya", "soybeans"],
  egg: ["egg", "eggs"],
  "tree nuts": ["nuts", "tree-nuts"],
  sesame: ["sesame", "sesame-seeds"],
};

const findDeclaredAllergyConflicts = (
  userAllergies = [],
  productAllergens = []
) => {
  const tags = productAllergens.map(normalizeAllergen);

  return userAllergies.filter((allergy) => {
    const normalizedAllergy = normalizeAllergen(allergy);
    const aliases = ALLERGEN_ALIASES[normalizedAllergy] || [
      normalizedAllergy,
    ];

    return aliases.some((alias) => tags.includes(alias));
  });
};

const findIngredientAllergyConflicts = (
  userAllergies = [],
  ingredients = []
) => {
  const ingredientText = ingredients
    .join(" ")
    .toLowerCase();

  const INGREDIENT_KEYWORDS = {
    milk: [
      "milk",
      "skim milk",
      "milk powder",
      "whey",
      "casein",
      "lactose",
      "butter",
      "cream"
    ],
    peanut: ["peanut", "groundnut"],
    gluten: [
      "wheat",
      "barley",
      "rye",
      "malt",
      "gluten",
      "semolina",
      "maida"
    ],
    soy: ["soy", "soya", "soybean"],
    egg: ["egg", "egg powder", "albumin"],
    "tree nuts": [
      "almond",
      "cashew",
      "walnut",
      "pistachio",
      "hazelnut",
      "pecan"
    ],
    sesame: ["sesame", "til"]
  };

  return userAllergies.filter((allergy) => {
    const normalizedAllergy = normalizeAllergen(allergy);

    const keywords =
      INGREDIENT_KEYWORDS[normalizedAllergy] || [];

    return keywords.some((keyword) =>
      new RegExp(
        `(^|[^a-z])${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`,
        "i"
      ).test(ingredientText)
    );
  });
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

// 15. Apply deterministic allergen verification
const declaredAllergyConflicts = findDeclaredAllergyConflicts(
  healthProfile.allergies || [],
  productAnalysis.allergens || []
);

let overallVerdict = getAIVerdict(aiAnalysis);

// A declared allergen conflict always takes priority.
if (declaredAllergyConflicts.length > 0) {
  overallVerdict = "AVOID";

  if (aiAnalysis?.personalizedAssessment) {
    aiAnalysis.personalizedAssessment.status = "AVOID";

    aiAnalysis.personalizedAssessment.allergyAssessment.status =
      "AVOID";

    aiAnalysis.personalizedAssessment.allergyAssessment.reasons = [
      ...(aiAnalysis.personalizedAssessment.allergyAssessment.reasons || []),
      `Open Food Facts declares these allergens: ${allAllergyConflicts.join(", ")}.`,
    ];

    aiAnalysis.personalizedAssessment.recommendation =
      "Avoid this product because it declares an allergen matching your health profile.";

    aiAnalysis.overallAssessment = "AVOID";
  }
}

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

    console.log("REQUEST BODY:", req.body);
    console.log("BARCODE VALUE:", barcode);
    console.log("BARCODE TYPE:", typeof barcode);
    console.log("NEW GROQ FALLBACK CONTROLLER IS RUNNING");

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

    // 3. Open Food Facts API fields
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
      "traces_tags",
      "ingredients_analysis_tags",
      "additives_tags",
    ].join(",");

    const url = `https://world.openfoodfacts.org/api/v3/product/${cleanBarcode}.json?fields=${fields}`;

    console.log("Fetching Open Food Facts:", cleanBarcode);
    console.log("NEW GROQ FALLBACK CONTROLLER IS RUNNING");

    // 4. Fetch Open Food Facts
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "LabelSach/1.0 (food product scanner)",
      },
    });

    let data;

    try {
      data = await response.json();
    } catch (parseError) {
      console.error("OFF parsing failed:", parseError.message);

      return res.status(502).json({
        success: false,
        message: "Invalid response received from Open Food Facts.",
      });
    }

    console.log("OFF RESPONSE STATUS:", data.status);
    console.log("OFF PRODUCT EXISTS:", Boolean(data.product));

    // 5. Check whether OFF found the product
    const offProductFound =
      response.ok &&
      data.status !== 0 &&
      Boolean(data.product);

    let product;
    let barcodeSearchSources = [];
    let barcodeMatchConfirmed = false;

    // 6. If OFF does not find product, use Groq Browser Search
    if (!offProductFound) {
      // Do not use fallback for unrelated OFF server errors
      if (
        response.status !== 404 &&
        data.status !== 0 &&
        !response.ok
      ) {
        return res.status(502).json({
          success: false,
          message: "Open Food Facts service is temporarily unavailable.",
          upstreamStatus: response.status,
        });
      }

      console.log("Product not found in OFF. Trying Groq search...");

      let searchResult;

      try {
        searchResult = await searchProductByBarcodeWithAI({
          barcode: cleanBarcode,
        });
      
} catch (searchError) {
  const errorMessage = searchError?.message || "";

  console.error("Groq barcode search failed:", errorMessage);

  const isRateLimit =
    /rate limit|tokens per day|TPD|429|too many requests/i.test(
      errorMessage
    );

  if (isRateLimit) {
    const retryAfterSeconds =
      getRetryAfterSeconds(errorMessage);

    return res.status(503).json({
      success: false,
      code: "GROQ_RATE_LIMIT",
      errorType: "AI_SEARCH_TEMPORARILY_UNAVAILABLE",

      message:
        "This product is not available in Open Food Facts, and our backup AI search has temporarily reached its usage limit.",

      userMessage: retryAfterSeconds
        ? `Product details could not be retrieved right now. Please try again in approximately ${Math.ceil(retryAfterSeconds / 60)} minutes.`
        : "Product details could not be retrieved right now. Please try again later.",

      retryAfterSeconds,

      barcode: cleanBarcode,

      sources: {
        primary: "Open Food Facts",
        fallback: "Groq AI",
      },

      canRetry: true,
    });
  }

  return res.status(502).json({
    success: false,
    code: "GROQ_SEARCH_FAILED",
    errorType: "AI_SEARCH_FAILED",

    message:
      "Product was not found in Open Food Facts, and the backup AI search failed.",

    userMessage:
      "We could not retrieve this product's details. Please try again later.",

    barcode: cleanBarcode,
    retryAfterSeconds: null,
    canRetry: true,
  });
}


      console.log(
        "GROQ SEARCH RESULT:",
        JSON.stringify(searchResult, null, 2)
      );

      // Require exact barcode confirmation and source references
      if (
        !searchResult?.found ||
        !searchResult?.barcodeMatchConfirmed ||
        String(searchResult.barcode) !== cleanBarcode ||
        !Array.isArray(searchResult.sources) ||
        searchResult.sources.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message: "Product could not be reliably verified using its barcode.",
          barcode: cleanBarcode,
          source: "Groq Browser Search",
        });
      }

      barcodeMatchConfirmed = true;
      barcodeSearchSources = searchResult.sources;

      // Convert Groq result into OFF-like product structure
      product = {
        code: cleanBarcode,
        product_name: searchResult.productName || "",
        brands: searchResult.brand || "",
        ingredients_text: searchResult.ingredientsText || "",
        ingredients: (searchResult.ingredients || []).map((item) => {
          return typeof item === "string"
            ? { text: item }
            : item;
        }),
        image_url: null,
        nutriments: searchResult.nutrition || {},
        allergens_tags: searchResult.allergens || [],
        traces_tags: searchResult.traces || [],
        ingredients_analysis_tags: [],
        additives_tags: [],
      };

      console.log("Product retrieved through Groq:", product.product_name);
    } else {
      // 7. Product found in Open Food Facts
      product = data.product;

      console.log(
        "Product found in OFF:",
        product.product_name || cleanBarcode
      );
    }

    // 8. Extract ingredients
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

    // 9. Extract nutrition
    const nutriments = product.nutriments || {};

    const nutrition = {
      energyKcal100g:
        nutriments["energy-kcal_100g"] ??
        nutriments.energyKcal100g ??
        null,

      fat100g:
        nutriments.fat_100g ??
        nutriments.fat100g ??
        null,

      saturatedFat100g:
        nutriments["saturated-fat_100g"] ??
        nutriments.saturatedFat100g ??
        null,

      carbohydrates100g:
        nutriments.carbohydrates_100g ??
        nutriments.carbohydrates100g ??
        null,

      sugars100g:
        nutriments.sugars_100g ??
        nutriments.sugars100g ??
        null,

      proteins100g:
        nutriments.proteins_100g ??
        nutriments.proteins100g ??
        null,

      salt100g:
        nutriments.salt_100g ??
        nutriments.salt100g ??
        null,

      sodium100g:
        nutriments.sodium_100g ??
        nutriments.sodium100g ??
        null,
    };

    // 10. Extract product analysis
    const productAnalysis = {
      allergens: product.allergens_tags || [],
      traces: product.traces_tags || [],
      ingredientAnalysisTags:
        product.ingredients_analysis_tags || [],
      additives: product.additives_tags || [],
      sources: barcodeSearchSources,
      barcodeMatchConfirmed,
    };

    // 11. Product details
    const productDetails = {
      name: product.product_name || "Unknown product",
      brand: product.brands || "Unknown brand",
      image: product.image_url || null,
    };

    // 12. Analyze using existing Groq AI function
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
        "Groq ingredient analysis failed:",
        aiError.message
      );
    }

    // 13. Deterministic allergen verification

    // Check declared allergen tags
    const declaredTagConflicts = findDeclaredAllergyConflicts(
      healthProfile.allergies || [],
      productAnalysis.allergens || []
    );

    // Check allergens inside ingredient list
    const ingredientConflicts = findIngredientAllergyConflicts(
      healthProfile.allergies || [],
      normalizedIngredients
    );

    // Check possible cross-contact traces
    const traceAllergyConflicts = findDeclaredAllergyConflicts(
      healthProfile.allergies || [],
      productAnalysis.traces || []
    );

    // Combine all allergen conflicts
    const allAllergyConflicts = [
      ...new Set([
        ...declaredTagConflicts,
        ...ingredientConflicts,
        ...traceAllergyConflicts,
      ]),
    ];

    // Get initial verdict from AI
    let overallVerdict = getAIVerdict(aiAnalysis);

    // Missing ingredients = UNVERIFIED
    if (normalizedIngredients.length === 0) {
      overallVerdict = "UNVERIFIED";
    }

    // Conservative policy:
    // Any matching allergen, ingredient, or trace = AVOID
    if (allAllergyConflicts.length > 0) {
      overallVerdict = "AVOID";

      if (aiAnalysis?.personalizedAssessment) {
        aiAnalysis.personalizedAssessment.status = "AVOID";

        if (aiAnalysis.personalizedAssessment.allergyAssessment) {
          aiAnalysis.personalizedAssessment.allergyAssessment.status =
            "AVOID";

          aiAnalysis.personalizedAssessment.allergyAssessment.reasons = [
            ...(aiAnalysis.personalizedAssessment.allergyAssessment.reasons || []),
            `Allergens matching your profile: ${allAllergyConflicts.join(", ")}.`,
          ];
        }

        aiAnalysis.personalizedAssessment.recommendation =
          "Avoid this product because allergens matching your health profile were detected.";

        aiAnalysis.overallAssessment = "AVOID";
      }
    }

    // 14. Generate clear verdict reasons independently of AI
    const verdictReasons = [];

    if (declaredTagConflicts.length > 0) {
      verdictReasons.push(
        `Open Food Facts allergen tags match your profile: ${declaredTagConflicts.join(", ")}.`
      );
    }

    if (ingredientConflicts.length > 0) {
      verdictReasons.push(
        `Matching allergens were found in the ingredient list: ${ingredientConflicts.join(", ")}.`
      );
    }

    if (traceAllergyConflicts.length > 0) {
      verdictReasons.push(
        `Possible cross-contact traces match your profile: ${traceAllergyConflicts.join(", ")}.`
      );
    }

    if (normalizedIngredients.length === 0) {
      verdictReasons.push(
        "Ingredient information is missing, so the product cannot be fully verified."
      );
    }

    // Use AI recommendation if available and no deterministic reason exists
    if (
      verdictReasons.length === 0 &&
      aiAnalysis?.personalizedAssessment?.recommendation
    ) {
      verdictReasons.push(
        aiAnalysis.personalizedAssessment.recommendation
      );
    }

    // Groq unavailable: provide fallback explanation
    if (verdictReasons.length === 0 && !aiAnalysis) {
      verdictReasons.push(
        "AI analysis is unavailable. No matching allergens were identified in the available data, but this does not confirm that the product is safe."
      );
    }

    // Final fallback reason
    if (verdictReasons.length === 0) {
      verdictReasons.push(
        `The product received a ${overallVerdict} verdict based on the available analysis.`
      );
    }

    // 15. Save scan history
    const savedScan = await ScanHistory.create({
      user: req.user._id,
      scanType: "barcode",
      barcode: cleanBarcode,
      product: productDetails,
      ingredientsText: ingredientsText || null,
      ingredients: normalizedIngredients,
      overallVerdict,
      nutrition,
      aiAnalysis,
    });

    // 16. Send response
    return res.status(200).json({
      success: true,

      message: !normalizedIngredients.length
        ? "Product found, but ingredient information is unavailable. Result is unverified."
        : aiAnalysis
          ? "Product scanned and analyzed successfully."
          : "Product found, but AI analysis is currently unavailable.",

      scanId: savedScan._id,
      barcode: cleanBarcode,
      overallVerdict,
      verdictReasons,

      product: {
        ...productDetails,
        ingredientsText: ingredientsText || null,
        ingredients: normalizedIngredients,
        productAnalysis,
      },

      nutrition,
      aiAnalysis,

      source: barcodeMatchConfirmed
        ? "Groq Browser Search"
        : "Open Food Facts",
    });

  } catch (error) {
    console.error("Barcode scan error:", error);

    if (
      error.name === "TimeoutError" ||
      error.name === "AbortError"
    ) {
      return res.status(504).json({
        success: false,
        message: "Barcode lookup timed out. Please try again.",
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
