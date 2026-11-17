
import mongoose from "mongoose";

const scanHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    scanType: {
      type: String,
      enum: ["manual", "barcode"],
      required: true,
    },

    barcode: {
      type: String,
      trim: true,
      default: null,
    },

    product: {
      name: { type: String, trim: true, default: null },
      brand: { type: String, trim: true, default: null },
      image: { type: String, trim: true, default: null },
    },

    ingredientsText: {
      type: String,
      trim: true,
      default: null,
    },

    ingredients: {
      type: [String],
      default: [],
    },

    matchedIngredients: [
      {
        name: { type: String, required: true },
        slug: { type: String, required: true },
      },
    ],

    unmatchedIngredients: {
      type: [String],
      default: [],
    },

    warnings: [
      {
        ingredient: String,
        ruleType: {
          type: String,
          enum: ["allergy", "condition", "diet"],
        },
        target: String,
        severity: {
          type: String,
          enum: ["info", "caution", "avoid"],
        },
        message: {
          en: String,
          hi: String,
        },
        reason: {
          en: String,
          hi: String,
        },
      },
    ],

    overallVerdict: {
      type: String,
      enum: ["AVOID", "CAUTION", "OK", "UNKNOWN"],
      default: "UNKNOWN",
    },

    isSaved: {
  type: Boolean,
  default: false,
},

    nutrition: {
      energyKcal100g: { type: Number, default: null },
      fat100g: { type: Number, default: null },
      saturatedFat100g: { type: Number, default: null },
      carbohydrates100g: { type: Number, default: null },
      sugars100g: { type: Number, default: null },
      proteins100g: { type: Number, default: null },
      salt100g: { type: Number, default: null },
      sodium100g: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

scanHistorySchema.index({ user: 1, createdAt: -1 });

export const ScanHistory =
  mongoose.models.ScanHistory ||
  mongoose.model("ScanHistory", scanHistorySchema);
