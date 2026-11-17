import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    scan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScanHistory",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportType: {
      type: String,
      enum: [
        "incorrect_product",
        "incorrect_ingredient",
        "incorrect_verdict",
        "missing_ingredients",
        "incorrect_nutrition",
        "other",
      ],
      required: true,
    },
    description: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ["pending", "reviewed", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);
