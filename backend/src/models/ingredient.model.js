
import mongoose from "mongoose";

export const INGREDIENT_CATEGORIES = [
  "colour",
  "preservative",
  "sweetener",
  "flavour",
  "emulsifier",
  "antioxidant",
  "thickener",
  "other",
];

export const FSSAI_STATUSES = [
  "permitted",
  "restricted",
  "not_permitted",
  "unknown",
];

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, trim: true },
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    aliases: [{ type: String, lowercase: true, trim: true }],

    insNumber: { type: String, trim: true },

    category: {
      type: String,
      enum: INGREDIENT_CATEGORIES,
      default: "other",
    },

    fssaiStatus: {
      type: String,
      enum: FSSAI_STATUSES,
      default: "unknown",
    },

    explanation: {
      en: { type: String, trim: true },
    },

    whyUsed: {
      en: { type: String, trim: true },
    },

    whoShouldBeCareful: [
      {
        type: String,
        trim: true,
      },
    ],

    sources: [
      {
        name: { type: String, required: true },
        url: { type: String },
      },
    ],

    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ingredientSchema.index({ aliases: 1 });
ingredientSchema.index({ insNumber: 1 });

export const Ingredient =
  mongoose.models.Ingredient ||
  mongoose.model("Ingredient", ingredientSchema);
