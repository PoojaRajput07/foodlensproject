
import mongoose from "mongoose";

export const RULE_TYPES = [
  "allergy",
  "condition",
  "diet",
];

export const RULE_SEVERITIES = [
  "info",
  "caution",
  "avoid",
];

const ruleSchema = new mongoose.Schema(
  {
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },

    ruleType: {
      type: String,
      enum: RULE_TYPES,
      required: true,
    },

    target: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    severity: {
      type: String,
      enum: RULE_SEVERITIES,
      required: true,
    },

    message: {
      en: {
        type: String,
        required: true,
        trim: true,
      },
      hi: {
        type: String,
        trim: true,
      },
    },

    reason: {
      en: { type: String, trim: true },
      hi: { type: String, trim: true },
    },

    source: {
      name: { type: String, trim: true },
      url: { type: String, trim: true },
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ruleSchema.index(
  { ingredient: 1, ruleType: 1, target: 1 },
  { unique: true }
);

export const Rule = mongoose.model("Rule", ruleSchema);
