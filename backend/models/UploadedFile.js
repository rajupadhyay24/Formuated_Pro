import mongoose from "mongoose";

const UploadedFileSchema = new mongoose.Schema({
  name: String,           
  path: String,           
  status: { type: String, default: "done" },
  extractedData: {
    name: String,
    dob: String,
    fatherName: String,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("UploadedFile", UploadedFileSchema);
