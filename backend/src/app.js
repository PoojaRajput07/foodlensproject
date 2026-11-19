import dotenv from "dotenv";
dotenv.config();

import { connectDb } from "./config/db.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.route.js";
import scanRoutes from "./routes/scan.routes.js";
import scanHistoryRoutes from "./routes/scanHistory.routes.js";

import dashboardRoutes from "./routes/dashboard.routes.js";

await connectDb();

const app = express();
app.set("trust proxy", 1);

// Security headers
// crossOriginResourcePolicy disabled so the browser can fetch from frontend dev origin
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS


const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL?.trim(),
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing
app.use(express.json({ limit: "1mb" }));

app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const scanLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: { success: false, message: "Too many scan requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/scan", scanLimiter, scanRoutes);
app.use("/api/scans/history", scanHistoryRoutes);  // kept for backwards compat
app.use("/api/dashboard", dashboardRoutes);


// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "FoodLens API is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
