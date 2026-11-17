
import "dotenv/config";
import mongoose from "mongoose";
import { Ingredient } from "../models/ingredient.model.js";
import { evaluateIngredients } from "../services/rulesengine.js";

async function testRulesEngine() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const ingredient = await Ingredient.findOne({
      slug: "tartrazine",
    });

    if (!ingredient) {
      throw new Error("Tartrazine not found in database");
    }

    const results = await evaluateIngredients({
      ingredientIds: [ingredient._id],
      healthProfile: {
        allergies: ["peanut"],
        conditions: [],
        diet: "veg",
      },
    });

    console.log("Engine results:", results);
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testRulesEngine();
