import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/emailService.js";

dotenv.config();

const router = express.Router();

// Helper: Generate verification token
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// POST /auth/signup - Email/Password registration
router.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      emailVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    await newUser.save();

    // Send verification email
    try {
      await sendVerificationEmail(newUser, verificationToken);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr.message);
      // Continue anyway - user can resend later
    }

    res.status(201).json({
      message: "Account created. Please verify your email address to continue."
    });
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

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        emailNotVerified: true,
        message: "Please verify your email address before logging in."
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
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

    const googleResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!googleResponse.ok) {
      return res.status(400).json({ message: "Failed to authenticate with Google" });
    }

    const profile = await googleResponse.json();
    const { email, given_name, family_name } = profile;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        firstName: given_name,
        lastName: family_name,
        emailVerified: true, // Google already verifies email
      });
      await user.save();
    } else {
      // Ensure existing user is marked as verified
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }
    }

    const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /auth/verify-email/:token - Verify email token
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token. Please request a new verification email."
      });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Generate JWT token for auto-login
    const jwtToken = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return token and user data to frontend
    res.status(200).json({
      message: "Email verified successfully",
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        setupComplete: user.setupComplete || false,
      },
      redirectUrl: "/setup"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /auth/resend-verification - Resend verification email
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal if user exists or not
      return res.status(200).json({
        message: "If an account exists with that email, a verification email has been sent."
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified." });
    }

    // Generate new token
    const verificationToken = generateVerificationToken();
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr.message);
      return res.status(500).json({ message: "Failed to send verification email. Please try again." });
    }

    res.status(200).json({
      message: "Verification email has been sent. Please check your inbox."
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /auth/me - Get current user profile
router.get("/me", async (req, res) => {
  try {
    // This route is protected by verifyToken middleware (to be added)
    // Will be handled by ProtectedRoute in the app - but we can add a simple check
    const token = req.header("Authorization");

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
      emailVerified: user.emailVerified,
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
    const token = req.header("Authorization");

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