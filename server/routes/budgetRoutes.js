import express from "express";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import { verifyToken } from "../middleware/auth.js";
import mongoose from "mongoose";

const router = express.Router();

// GET /budget — all budgets for user, with current-month `spent` computed from transactions
router.get("/", verifyToken, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });

    // Current month window
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Aggregate expenses by category for current month
    const spentByCategory = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          sign: "expense",
          date: { $gte: monthStart, $lt: monthEnd }
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);

    const spentMap = {};
    spentByCategory.forEach(({ _id, total }) => {
      spentMap[_id] = total;
    });

    const result = budgets.map((b) => ({
      id: b._id,
      label: b.label,
      category: b.category,
      icon: b.icon,
      color: b.color,
      limit: b.limit,
      spent: spentMap[b.category] ?? 0
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch budgets", error: error.message });
  }
});

// POST /budget — create a new budget
router.post("/", verifyToken, async (req, res) => {
  try {
    const { label, category, icon, color, limit } = req.body;

    // Prevent duplicate categories per user
    const existing = await Budget.findOne({ userId: req.user.id, category });
    if (existing) {
      return res.status(409).json({ message: "Budget for this category already exists" });
    }

    const budget = new Budget({ userId: req.user.id, label, category, icon, color, limit });
    const saved = await budget.save();

    res.status(201).json({
      id: saved._id,
      label: saved.label,
      category: saved.category,
      icon: saved.icon,
      color: saved.color,
      limit: saved.limit,
      spent: 0
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to create budget", error: error.message });
  }
});

// PUT /budget/:id — update limit
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: "Budget not found" });

    if (budget.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { limit } = req.body;
    if (!limit || isNaN(Number(limit)) || Number(limit) <= 0) {
      return res.status(400).json({ message: "Invalid limit value" });
    }

    budget.limit = Number(limit);
    await budget.save();

    res.status(200).json({ id: budget._id, limit: budget.limit });
  } catch (error) {
    res.status(500).json({ message: "Failed to update budget", error: error.message });
  }
});

// DELETE /budget/:id
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: "Budget not found" });

    if (budget.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Budget.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete budget", error: error.message });
  }
});

export default router;
