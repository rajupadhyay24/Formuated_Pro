import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();


router.post('/register', async (req, res) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const userExists = await User.findOne({ emailId });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = new User(req.body);
    const savedUser = await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        name: savedUser.candidateName,
        emailId: savedUser.emailId,
      }
    });
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



router.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res.status(400).json({ message: "Email ID and Password are required." });
    }

    const user = await User.findOne({ emailId });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ message: "Invalid credentials." });

    const token = jwt.sign(
      { userId: user._id, emailId: user.emailId },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.candidateName,
        emailId: user.emailId,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
