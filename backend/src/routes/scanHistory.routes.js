
import express from "express";
import {
  getScanHistory,
  deleteScanHistory,
  toggleSavedScan,
} from "../controllers/scanHistory.controller.js";
import { reportScan } from "../controllers/report.controller.js";
import { verifyuser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyuser, getScanHistory);

router.patch("/:id/save", verifyuser, toggleSavedScan);

router.delete("/:id", verifyuser, deleteScanHistory);

router.post("/:id/report", verifyuser, reportScan);

export default router;
