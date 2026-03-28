import express from "express";
import Card from "../models/Card.js";
import Transaction from "../models/Transaction.js";
import { plaidClient } from "../../src/utils/plaidClient.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

const VALID_COLORS = ["slate", "indigo", "emerald", "rose", "amber", "violet"];

router.get("/", verifyToken, async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user.id }).sort({ createdAt: 1 });
    const formatted = cards.map((c) => ({
      id:             c._id,
      cardholderName: c.cardholderName,
      lastFour:       c.lastFour,
      bank:           c.bank,
      cardType:       c.cardType,
      color:          c.color,
      colorFrom:      c.colorFrom,
      colorTo:        c.colorTo,
      connectedAt:    c.createdAt,
      isPlaidLinked:  !!c.plaidItemId,
    }));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cards.", error: error.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card)                                   return res.status(404).json({ message: "Card not found." });
    if (card.userId.toString() !== req.user.id)  return res.status(403).json({ message: "Unauthorized." });

    const { color, colorFrom, colorTo } = req.body;
    if (color && !VALID_COLORS.includes(color)) {
      return res.status(400).json({ message: `color must be one of: ${VALID_COLORS.join(", ")}.` });
    }

    if (color)     card.color     = color;
    if (colorFrom) card.colorFrom = colorFrom;
    if (colorTo)   card.colorTo   = colorTo;

    const updated = await card.save();
    res.status(200).json({
      id:             updated._id,
      cardholderName: updated.cardholderName,
      lastFour:       updated.lastFour,
      bank:           updated.bank,
      cardType:       updated.cardType,
      color:          updated.color,
      colorFrom:      updated.colorFrom,
      colorTo:        updated.colorTo,
      connectedAt:    updated.createdAt,
      isPlaidLinked:  !!updated.plaidItemId,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to update card.", error: error.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id).select("+plaidAccessToken");
    if (!card)                                   return res.status(404).json({ message: "Card not found." });
    if (card.userId.toString() !== req.user.id)  return res.status(403).json({ message: "Unauthorized." });

    if (card.plaidAccessToken) {
      try {
        await plaidClient.itemRemove({ access_token: card.plaidAccessToken });
      } catch (plaidErr) {
        console.warn("Plaid itemRemove warning:", plaidErr.response?.data?.error_message || plaidErr.message);
      }
    }

    await Transaction.deleteMany({ cardId: card._id, source: "plaid" });
    await Card.findByIdAndDelete(card._id);
    res.status(200).json({ message: "Card disconnected and transactions removed." });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove card.", error: error.message });
  }
});

export default router;