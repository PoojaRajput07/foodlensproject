import { Router } from "express";
import multer from "multer";
import path from "path";
import { scanBarcode, scanFood, scanOCR } from "../controllers/scan.controller.js";
import { verifyuser } from "../middlewares/auth.middleware.js";
import {
  getScanHistory,
  getScanById,
  getScanStats,
} from "../controllers/scanHistory.controller.js";

const router = Router();

// Multer config for OCR image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve("uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `ocr-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Scan routes
router.post("/ingredients", verifyuser, scanFood);
router.post("/barcode", verifyuser, scanBarcode);
router.post(
  "/ocr",
  verifyuser,
  (req, res, next) => {
    console.log("OCR REQUEST RECEIVED");
    next();
  },
  upload.single("image"),
  (req, res, next) => {
    console.log("MULTER FILE:", req.file);
    console.log("MULTER BODY:", req.body);
    next();
  },
  scanOCR
);

// History routes (also accessible here for convenience)
router.get("/history", verifyuser, getScanHistory);
router.get("/stats", verifyuser, getScanStats);
router.get("/:id", verifyuser, getScanById);

export default router;
