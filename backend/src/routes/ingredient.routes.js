
import express from "express";
import {
  getIngredients,
  getIngredientBySlug,
  searchIngredients,
} from "../controllers/ingredient.controller.js";

const router = express.Router();

router.get("/", getIngredients);
router.get("/search", searchIngredients);
router.get("/:slug", getIngredientBySlug);

export default router;
