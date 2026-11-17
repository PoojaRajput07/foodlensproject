import mongoose from "mongoose";
import { Report } from "../models/report.model.js";
import { ScanHistory } from "../models/ScanHistory.model.js";

const VALID_REPORT_TYPES = [
  "incorrect_product",
  "incorrect_ingredient",
  "incorrect_verdict",
  "missing_ingredients",
  "incorrect_nutrition",
  "other",
];

export const reportScan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scan ID",
      });
    }

    // Validate scan belongs to user
    const scan = await ScanHistory.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found",
      });
    }

    const { reportType, description } = req.body;

    if (!reportType || !VALID_REPORT_TYPES.includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: `reportType must be one of: ${VALID_REPORT_TYPES.join(", ")}`,
      });
    }

    if (description && typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "description must be a string",
      });
    }

    if (description && description.length > 500) {
      return res.status(400).json({
        success: false,
        message: "description must be at most 500 characters",
      });
    }

    await Report.create({
      scan: scan._id,
      user: req.user._id,
      reportType,
      description: description || undefined,
    });

    return res.status(201).json({
      success: true,
      message: "Report submitted. Thank you.",
    });
  } catch (error) {
    console.error("Report scan error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to submit report",
    });
  }
};
