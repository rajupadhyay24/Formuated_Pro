
import express from "express";
import Marksheet from "../models/Marksheet.js";

const router = express.Router();


router.get("/latest/:studentName", async (req, res) => {
  try {
    const { studentName } = req.params;
    const data = await Marksheet.findOne({ name: studentName }).sort({ uploadedAt: -1 });
    if (!data) return res.status(404).json({ message: "No data found" });
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
