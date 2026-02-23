import mongoose from "mongoose";

const marksheetSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    extractedText: { type: String },
    importantData: { type: Object }, 
    image: {
      data: Buffer,
      contentType: String,
    },
    uploadedAt: { type: Date, default: Date.now },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Marksheet", marksheetSchema);
