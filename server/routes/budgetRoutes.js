import express from "express";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import { verifyToken } from "../middleware/auth.js";
import mongoose from "mongoose";

const router = express.Router();

const MAX_LIMIT = 999_999;

router.get("/", verifyToken, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });

    // FIX: Removed the monthStart/monthEnd filters so historical
    // synced Plaid transactions accurately aggregate into the budgets.
    const spentByCategory = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          sign: "expense",
        },
      },
      {
        $group: {
          // FIX: Convert all categories to lowercase to prevent "Food" vs "food" mapping failures
          _id: { $toLower: "$category" },
          total: { $sum: "$amount" },
        },
      },
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
      // Ensure we check against the lowercase version of the budget's category
      spent: spentMap[(b.category || "").toLowerCase()] ?? 0,
    }));

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch budgets", error: error.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { label, category, icon, color, limit } = req.body;

    const existing = await Budget.findOne({ userId: req.user.id, category });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Budget for this category already exists" });
    }

    if (
      !limit ||
      isNaN(Number(limit)) ||
      Number(limit) <= 0 ||
      Number(limit) > MAX_LIMIT
    ) {
      return res
        .status(400)
        .json({
          message: `Limit must be between $1 and $${MAX_LIMIT.toLocaleString()}.`,
        });
    }

    const budget = new Budget({
      userId: req.user.id,
      label,
      category,
      icon,
      color,
      limit,
    });
    const saved = await budget.save();

    res.status(201).json({
      id: saved._id,
      label: saved.label,
      category: saved.category,
      icon: saved.icon,
      color: saved.color,
      limit: saved.limit,
      spent: 0,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create budget", error: error.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: "Budget not found" });

    if (budget.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { limit } = req.body;
    if (
      !limit ||
      isNaN(Number(limit)) ||
      Number(limit) <= 0 ||
      Number(limit) > MAX_LIMIT
    ) {
      return res
        .status(400)
        .json({
          message: `Limit must be between $1 and $${MAX_LIMIT.toLocaleString()}.`,
        });
    }

    budget.limit = Number(limit);
    await budget.save();

    res.status(200).json({ id: budget._id, limit: budget.limit });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update budget", error: error.message });
  }
});

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
    res
      .status(500)
      .json({ message: "Failed to delete budget", error: error.message });
  }
});

export default router;
