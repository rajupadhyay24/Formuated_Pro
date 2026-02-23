
import express from 'express';
import mongoose from "mongoose";
import Application from '../models/Application.js'; 

const router = express.Router();


router.post('/save-filled-form', async (req, res) => {
  try {
    const { userId, formType, formData } = req.body;
    if (!userId || !formType || !formData) 
        return res.status(400).json({ message: 'Missing required data' });

    const newApp = await Application.create({ userId, formType, formData });
    res.status(200).json({ success: true, message: 'Form saved successfully', appId: newApp._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching applications for userId:", userId);

  
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const apps = await Application.find({ userId: new mongoose.Types.ObjectId(req.params.userId) });
    console.log("Applications found:", apps);

    res.status(200).json(apps);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


export default router;
