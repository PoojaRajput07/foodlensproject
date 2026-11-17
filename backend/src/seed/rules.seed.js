
import "dotenv/config";
import mongoose from "mongoose";
import { Ingredient } from "../models/ingredient.model.js";
import { Rule } from "../models/rules.model.js";

const rulesData = [
  {
    ingredientSlug: "tartrazine",
    ruleType: "allergy",
    target: "peanut",
    severity: "avoid",
    message: {
      en: "Example allergy warning for testing.",
      hi: "Yeh testing ke liye example allergy warning hai.",
    },
    reason: {
      en: "This is placeholder data, not a verified medical rule.",
      hi: "Yeh placeholder data hai, verified medical rule nahi.",
    },
  },
];

async function seedRules() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    for (const item of rulesData) {
      const ingredient = await Ingredient.findOne({
        slug: item.ingredientSlug,
      });

      if (!ingredient) {
        console.log(`Ingredient not found: ${item.ingredientSlug}`);
        continue;
      }

      await Rule.updateOne(
        {
          ingredient: ingredient._id,
          ruleType: item.ruleType,
          target: item.target,
        },
        {
          $set: {
            ingredient: ingredient._id,
            ruleType: item.ruleType,
            target: item.target,
            severity: item.severity,
            message: item.message,
            reason: item.reason,
            verified: false,
          },
        },
        { upsert: true, runValidators: true }
      );
    }

    console.log("Rule seed completed");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedRules();
