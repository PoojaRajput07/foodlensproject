
import { ScanHistory } from "../models/ScanHistory.model.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total scans and verdict counts
    const [totalScans, verdictCounts, recentScans] =
      await Promise.all([
        ScanHistory.countDocuments({ user: userId }),

        ScanHistory.aggregate([
          {
            $match: {
              user: userId,
            },
          },
          {
            $group: {
              _id: "$overallVerdict",
              count: { $sum: 1 },
            },
          },
        ]),

        ScanHistory.find({ user: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select(
            "scanType barcode product ingredients overallVerdict warnings nutrition createdAt"
          )
          .lean(),
      ]);

    // Convert verdict counts into dashboard format
    const counts = {
      AVOID: 0,
      CAUTION: 0,
      OK: 0,
      UNKNOWN: 0,
    };

    verdictCounts.forEach((item) => {
      if (item._id && counts[item._id] !== undefined) {
        counts[item._id] = item.count;
      }
    });

    return res.status(200).json({
      success: true,
      dashboard: {
        totalScans,
        avoidCount: counts.AVOID,
        cautionCount: counts.CAUTION,
        okCount: counts.OK,
        unknownCount: counts.UNKNOWN,
        recentScans,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard",
    });
  }
};
