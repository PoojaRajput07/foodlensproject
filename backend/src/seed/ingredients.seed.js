
import "dotenv/config";
import mongoose from "mongoose";
import { Ingredient } from "../models/ingredient.model.js";

const ingredients = [
  {
    name: { en: "Tartrazine" },
    slug: "tartrazine",
    aliases: ["yellow 5", "e102", "ins 102", "ins102"],
    insNumber: "102",
    category: "colour",
    explanation: {
      en: "A synthetic yellow food colour used to give food a yellow appearance.",
    },
    whyUsed: {
      en: "Used to provide or maintain a yellow colour in food products.",
    },
    whoShouldBeCareful: [
      "People with a known sensitivity to this colour should check product labels.",
    ],
    sources: [],
    fssaiStatus: "unknown",
    verified: false,
  },
  {
    name: { en: "Sodium benzoate" },
    slug: "sodium-benzoate",
    aliases: ["e211", "ins 211", "ins211"],
    insNumber: "211",
    category: "preservative",
    explanation: {
      en: "A preservative used to help prevent food spoilage.",
    },
    whyUsed: {
      en: "Used to help inhibit microbial growth and extend product shelf life.",
    },
    whoShouldBeCareful: [
      "People with a known sensitivity should check product labels.",
    ],
    sources: [],
    fssaiStatus: "unknown",
    verified: false,
  },
  {
    name: { en: "Monosodium glutamate" },
    slug: "monosodium-glutamate",
    aliases: ["msg", "e621", "ins 621", "ins621"],
    insNumber: "621",
    category: "flavour",
    explanation: {
      en: "A flavour enhancer used to add savoury taste.",
    },
    whyUsed: {
      en: "Used to enhance the savoury or umami taste of food.",
    },
    whoShouldBeCareful: [
      "People who have identified a personal sensitivity should check product labels.",
    ],
    sources: [],
    fssaiStatus: "unknown",
    verified: false,
  },
  {
    name: { en: "Aspartame" },
    slug: "aspartame",
    aliases: ["e951", "ins 951", "ins951"],
    insNumber: "951",
    category: "sweetener",
    explanation: {
      en: "A low-calorie artificial sweetener.",
    },
    whyUsed: {
      en: "Used to provide sweetness with a relatively small amount of energy.",
    },
    whoShouldBeCareful: [
      "People with phenylketonuria (PKU) must avoid aspartame because it is a source of phenylalanine.",
    ],
    sources: [],
    fssaiStatus: "unknown",
    verified: false,
  },
  {
    name: { en: "Citric acid" },
    slug: "citric-acid",
    aliases: ["e330", "ins 330", "ins330"],
    insNumber: "330",
    category: "antioxidant",
    explanation: {
      en: "An acid used to regulate acidity in foods.",
    },
    whyUsed: {
      en: "Used to regulate acidity and provide a sour taste in food products.",
    },
    whoShouldBeCareful: [
      "People with a known sensitivity should consider their individual tolerance.",
    ],
    sources: [],
    fssaiStatus: "unknown",
    verified: false,
  },
  {
    name: { en: "Lecithin" },
    slug: "lecithin",
    aliases: ["e322", "ins 322", "ins322", "soy lecithin"],
    insNumber: "322",
    category: "emulsifier",
    explanation: {
      en: "An emulsifier that helps ingredients mix together.",
    },
    whyUsed: {
      en: "Used to help oil and water-based ingredients remain mixed.",
    },
    whoShouldBeCareful: [
      "People with soy or other relevant source allergies should check the product's ingredient and allergen labels.",
    ],
    sources: [],
    fssaiStatus: "unknown",
    verified: false,
  },
  {
    name: { en: "Xanthan gum" },
    slug: "xanthan-gum",
    aliases: ["e415", "ins 415", "ins415"],
    insNumber: "415",
    category: "thickener",
    explanation: {
      en: "A thickener used to improve food texture.",
    },
    whyUsed: {
      en: "Used to thicken food and improve consistency.",
    },
    whoShouldBeCareful: [
      "People with an individual sensitivity or intolerance should consider their tolerance.",
    ],
    sources: [],
    fssaiStatus: "unknown",
    verified: false,
  },
  {
    name: { en: "Potassium sorbate" },
    slug: "potassium-sorbate",
    aliases: ["e202", "ins 202", "ins202"],
    insNumber: "202",
    category: "preservative",
    explanation: {
      en: "A preservative used to inhibit mould and yeast.",
    },
    whyUsed: {
      en: "Used to help prevent mould and yeast growth in food products.",
    },
    whoShouldBeCareful: [
      "People with a known sensitivity should check product labels.",
    ],
    sources: [],
    fssaiStatus: "unknown",
    verified: false,
  },
  {
    name: { en: "Ascorbic acid" },
    slug: "ascorbic-acid",
    aliases: ["vitamin c", "e300", "ins 300", "ins300"],
    insNumber: "300",
    category: "antioxidant",
    explanation: {
      en: "An antioxidant also known as vitamin C.",
    },
    whyUsed: {
      en: "Used to help prevent oxidation and maintain food quality.",
    },
    whoShouldBeCareful: [
      "People who need to monitor their vitamin C intake should consider the overall product composition.",
    ],
    sources: [],
    fssaiStatus: "unknown",
    verified: false,
  },
  {
    name: { en: "Sucralose" },
    slug: "sucralose",
    aliases: ["e955", "ins 955", "ins955"],
    insNumber: "955",
    category: "sweetener",
    explanation: {
      en: "A high-intensity artificial sweetener.",
    },
    whyUsed: {
      en: "Used to provide sweetness in food and beverage products.",
    },
    whoShouldBeCareful: [
      "People who prefer to avoid artificial sweeteners should check product labels.",
    ],
    sources: [],
    fssaiStatus: "unknown",
    verified: false,
  },
  {
    name: { en: "Sugar" },
    slug: "sugar",
    aliases: ["sucrose", "table sugar", "white sugar"],
    category: "other",
    explanation: {
      en: "A sweetening ingredient used in many foods.",
    },
    whyUsed: {
      en: "Used to provide sweetness, texture and other functional properties in food.",
    },
    whoShouldBeCareful: [
      "People monitoring their sugar intake should check the nutritional information.",
      "People managing blood glucose should consider the total carbohydrate and sugar content.",
    ],
    sources: [],
    fssaiStatus: "unknown",
    verified: false,
  },
  {
    name: { en: "Palm oil" },
    slug: "palm-oil",
    aliases: ["palm oil", "palmolein", "palm olein", "palm fat"],
    category: "other",
    explanation: {
      en: "A vegetable oil obtained from the fruit of the oil palm.",
    },
    whyUsed: {
      en: "Used as a cooking fat and to provide texture and consistency in food products.",
    },
    whoShouldBeCareful: [
      "People monitoring saturated fat intake should check the product's nutrition information.",
    ],
    sources: [],
    fssaiStatus: "unknown",
    verified: false,
  },
];

async function seedIngredients() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    for (const ingredient of ingredients) {
      await Ingredient.updateOne(
        { slug: ingredient.slug },
        { $set: ingredient },
        { upsert: true, runValidators: true }
      );
    }

    console.log(`Successfully seeded ${ingredients.length} ingredients`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedIngredients();
