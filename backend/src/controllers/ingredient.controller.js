
import { Ingredient, INGREDIENT_CATEGORIES } from "../models/ingredient.model.js";

// GET INGREDIENT LIBRARY
export const getIngredients = async (req, res) => {
  try {
    const { q, category, fssaiStatus } = req.query;

    const filter = {};

    // Search by name, alias or INS number
    if (q && q.trim()) {
      const searchTerm = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(searchTerm, "i");

      filter.$or = [
        { "name.en": searchRegex },
        { aliases: searchRegex },
        { insNumber: searchRegex },
        { slug: searchRegex },
      ];
    }

    // Category filter
    if (category) {
      if (!INGREDIENT_CATEGORIES.includes(category.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "Invalid ingredient category",
        });
      }

      filter.category = category.toLowerCase();
    }

    // FSSAI status filter
    if (fssaiStatus) {
      const allowedStatuses = [
        "permitted",
        "restricted",
        "not_permitted",
        "unknown",
      ];

      if (!allowedStatuses.includes(fssaiStatus.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "Invalid FSSAI status",
        });
      }

      filter.fssaiStatus = fssaiStatus.toLowerCase();
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const [ingredients, total] = await Promise.all([
      Ingredient.find(filter)
        .select(
          "name slug aliases insNumber category fssaiStatus explanation verified"
        )
        .sort({ "name.en": 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ingredient.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: ingredients.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      ingredients,
    });
  } catch (error) {
    console.error("Ingredient library error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch ingredients",
    });
  }
};


// GET SINGLE INGREDIENT DETAILS
export const getIngredientBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const ingredient = await Ingredient.findOne({ slug })
      .select(
        "name slug aliases insNumber category fssaiStatus explanation whyUsed whoShouldBeCareful sources verified"
      )
      .lean();

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found",
      });
    }

    return res.status(200).json({
      success: true,
      ingredient,
    });
  } catch (error) {
    console.error("Ingredient details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch ingredient details",
    });
  }
};


// SEARCH INGREDIENTS WITH PAGINATION
export const searchIngredients = async (req, res) => {
  try {
    const { q, category, fssaiStatus } = req.query;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    if (q && q.trim()) {
      const searchTerm = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(searchTerm, "i");

      filter.$or = [
        { "name.en": searchRegex },
        { aliases: searchRegex },
        { insNumber: searchRegex },
        { slug: searchRegex },
      ];
    }

    if (category) {
      if (!INGREDIENT_CATEGORIES.includes(category.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "Invalid ingredient category",
        });
      }
      filter.category = category.toLowerCase();
    }

    if (fssaiStatus) {
      const allowedStatuses = ["permitted", "restricted", "not_permitted", "unknown"];
      if (!allowedStatuses.includes(fssaiStatus.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "Invalid FSSAI status",
        });
      }
      filter.fssaiStatus = fssaiStatus.toLowerCase();
    }

    const [ingredients, total] = await Promise.all([
      Ingredient.find(filter)
        .select(
          "name slug aliases insNumber category fssaiStatus explanation verified"
        )
        .sort({ "name.en": 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ingredient.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      count: ingredients.length,
      total,
      pagination: {
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      ingredients,
    });
  } catch (error) {
    console.error("Ingredient search error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to search ingredients",
    });
  }
};
