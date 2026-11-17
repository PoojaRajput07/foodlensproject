
import mongoose from "mongoose";
import { ScanHistory } from "../models/ScanHistory.model.js";

// GET SCAN HISTORY WITH VERDICT FILTER + PAGINATION
export const getScanHistory = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const skip = (page - 1) * limit;

    // Optional verdict filter
    const { verdict, saved } = req.query;

    const allowedVerdicts = ["AVOID", "CAUTION", "OK", "UNKNOWN"];

    if (verdict && !allowedVerdicts.includes(verdict.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid verdict filter",
      });
    }

    // Build database query
    const filter = {
      user: req.user._id,
    };

    if (saved === "true") {
  filter.isSaved = true;
}

    if (verdict) {
      filter.overallVerdict = verdict.toUpperCase();
    }

    // Fetch history and total count together
    const [scans, totalScan] = await Promise.all([
      ScanHistory.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      ScanHistory.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalScan / limit);

    return res.status(200).json({
      success: true,
      message: "Scan history fetched successfully",
      scans,
      pagination: {
        totalScan,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching scan history:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch scan history",
    });
  }
};


// DELETE ONE SCAN FROM HISTORY
export const deleteScanHistory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scan history ID",
      });
    }

    const deletedScan = await ScanHistory.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!deletedScan) {
      return res.status(404).json({
        success: false,
        message: "Scan history not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Scan history deleted successfully",
    });
  } catch (error) {
    console.error("Delete scan history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete scan history",
    });
  }
};



export const toggleSavedScan = async (req, res) => {
  try {
    const { id } = req.params;
    const { isSaved } = req.body;

    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scan history ID",
      });
    }

    if (typeof isSaved !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isSaved must be true or false",
      });
    }

    const scan = await ScanHistory.findOneAndUpdate(
      {
        _id: id,
        user: req.user._id,
      },
      {
        $set: { isSaved },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan history not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: isSaved
        ? "Product saved successfully"
        : "Product removed from saved items",
      scan,
    });
  } catch (error) {
    console.error("Toggle saved scan error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update saved product",
    });
  }
};


// GET SINGLE SCAN BY ID
export const getScanById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scan ID",
      });
    }

    const scan = await ScanHistory.findOne({
      _id: id,
      user: req.user._id,
    }).lean();

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found",
      });
    }

    return res.status(200).json({
      success: true,
      scan,
    });
  } catch (error) {
    console.error("Get scan by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch scan",
    });
  }
};

// GET AGGREGATE STATS FOR THE AUTHENTICATED USER
export const getScanStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalScans, avoidCount, cautionCount, okCount, unknownCount, savedCount] =
      await Promise.all([
        ScanHistory.countDocuments({ user: userId }),
        ScanHistory.countDocuments({ user: userId, overallVerdict: "AVOID" }),
        ScanHistory.countDocuments({ user: userId, overallVerdict: "CAUTION" }),
        ScanHistory.countDocuments({ user: userId, overallVerdict: "OK" }),
        ScanHistory.countDocuments({ user: userId, overallVerdict: "UNKNOWN" }),
        ScanHistory.countDocuments({ user: userId, isSaved: true }),
      ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalScans,
        avoidCount,
        cautionCount,
        okCount,
        unknownCount,
        savedCount,
      },
    });
  } catch (error) {
    console.error("Get scan stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch scan stats",
    });
  }
};
