
import express from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";
import { verifyuser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyuser, getDashboard);

export default router;
