import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const router = express.Router();

// POST /auth/signup - Email/Password registration
router.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /auth/signin - Email/Password login
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /auth/google - Google OAuth
router.post("/google", async (req, res) => {
  try {
    const { access_token } = req.body;

    const googleResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );

    if (!googleResponse.ok) {
      return res
        .status(400)
        .json({ message: "Failed to authenticate with Google" });
    }

    const profile = await googleResponse.json();
    const { email, given_name, family_name } = profile;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        firstName: given_name,
        lastName: family_name,
      });
      await user.save();
    }

    const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /auth/me - Get current user profile
router.get("/me", async (req, res) => {
  try {
    // This route is protected by verifyToken middleware (to be added)
    // Will be handled by ProtectedRoute in the app - but we can add a simple check
    let token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trimLeft();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      setupComplete: user.setupComplete || false,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: err.message });
  }
});

// PATCH /auth/setup-complete - Mark setup as complete
router.patch("/setup-complete", async (req, res) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trimLeft();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(verified.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.setupComplete = true;
    await user.save();

    res.status(200).json({ message: "Setup completed successfully" });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: err.message });
  }
});

export default router;
