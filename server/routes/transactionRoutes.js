import express from "express";
import Transaction from "../models/Transaction.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

const MAX_LIMIT = 999_999;

router.get("/", verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });

    const formattedTransactions = transactions.map((tx) => ({
      id: tx._id,
      label: tx.label,
      category: tx.category,
      amount: tx.amount,
      sign: tx.sign,
      date: tx.date.toISOString().split("T")[0],
    }));

    res.status(200).json(formattedTransactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || Number(amount) > MAX_LIMIT) {
      return res.status(400).json({ message: `Amount must be between $0.01 and $${MAX_LIMIT.toLocaleString()}.` });
    }

    const transactionData = {
      ...req.body,
      userId: req.user.id
    };

    const newTx = new Transaction(transactionData);
    const savedTx = await newTx.save();

    res.status(201).json({
      id: savedTx._id,
      label: savedTx.label,
      category: savedTx.category,
      amount: savedTx.amount,
      sign: savedTx.sign,
      date: savedTx.date.toISOString().split("T")[0],
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to create transaction", error: error.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    if (tx.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this transaction" });
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete transaction", error: error.message });
  }
});

export default router;