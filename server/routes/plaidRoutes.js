import express from "express";
import { CountryCode, Products } from "plaid";
import { plaidClient } from "../../src/utils/plaidClient.js";
import Card from "../models/Card.js";
import Transaction from "../models/Transaction.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

const VALID_COLORS = ["slate", "indigo", "emerald", "rose", "amber", "violet"];

function mapPlaidCategory(pfcPrimary, legacyCategories = []) {
  const src = (pfcPrimary || legacyCategories[0] || "").toLowerCase();
  if (/food|restaurant|grocery|dining|eat/.test(src))          return "Food";
  if (/transport|travel|taxi|uber|lyft|gas|fuel/.test(src))    return "Transport";
  if (/entertain|recreation|sport|game|movie|music/.test(src)) return "Entertainment";
  if (/utilities|utility|electric|water|internet|phone/.test(src)) return "Utilities";
  if (/health|medical|pharmacy|hospital|doctor/.test(src))     return "Health";
  if (/education|school|tuition|university/.test(src))         return "Education";
  if (/clothing|apparel|fashion|shoe/.test(src))               return "Clothing";
  if (/income|payroll|salary|deposit|transfer in/.test(src))   return "Income";
  return "Other";
}

function plaidTxToOurTx({ plaidTx, userId, cardId }) {
  const isExpense = plaidTx.amount > 0;
  const category  = isExpense
    ? mapPlaidCategory(plaidTx.personal_finance_category?.primary, plaidTx.category)
    : "Income";
  return {
    userId,
    cardId,
    label:              plaidTx.merchant_name || plaidTx.name || "Unknown",
    category,
    amount:             Math.abs(plaidTx.amount),
    sign:               isExpense ? "expense" : "income",
    date:               new Date(plaidTx.date),
    source:             "plaid",
    plaidTransactionId: plaidTx.transaction_id,
  };
}

async function syncCardTransactions(card) {
  const fullCard = await Card.findById(card._id).select("+plaidAccessToken +plaidCursor");
  if (!fullCard?.plaidAccessToken) return 0;

  let cursor  = fullCard.plaidCursor || undefined;
  let added   = [];
  let removed = [];
  let hasMore = true;

  while (hasMore) {
    const response = await plaidClient.transactionsSync({
      access_token: fullCard.plaidAccessToken,
      cursor,
      count: 100,
    });
    added   = added.concat(response.data.added);
    removed = removed.concat(response.data.removed);
    hasMore = response.data.has_more;
    cursor  = response.data.next_cursor;
  }

  let newCount = 0;
  for (const plaidTx of added) {
    try {
      await Transaction.create(plaidTxToOurTx({ plaidTx, userId: fullCard.userId, cardId: fullCard._id }));
      newCount++;
    } catch (err) {
      if (err.code !== 11000) throw err;
    }
  }

  if (removed.length > 0) {
    const removedIds = removed.map((r) => r.transaction_id);
    await Transaction.deleteMany({ plaidTransactionId: { $in: removedIds } });
  }

  await Card.findByIdAndUpdate(fullCard._id, { plaidCursor: cursor });
  return newCount;
}

router.post("/link-token", verifyToken, async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user:          { client_user_id: req.user.id },
      client_name:   process.env.APP_NAME || "Finance App",
      products:      [Products.Transactions],
      country_codes: [CountryCode.Us],
      language:      "en",
    });
    res.status(200).json({ link_token: response.data.link_token });
  } catch (error) {
    console.error("Plaid link-token error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to create Plaid link token." });
  }
});

router.post("/exchange", verifyToken, async (req, res) => {
  try {
    const { publicToken, metadata, color, colorFrom, colorTo } = req.body;

    if (!publicToken)                return res.status(400).json({ message: "publicToken is required." });
    if (!VALID_COLORS.includes(color)) return res.status(400).json({ message: "Invalid color selection." });

    const existing = await Card.countDocuments({ userId: req.user.id });
    if (existing >= 3) return res.status(400).json({ message: "You can connect a maximum of 3 cards." });

    const exchangeRes = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
    const accessToken = exchangeRes.data.access_token;
    const itemId      = exchangeRes.data.item_id;

    const accountsRes = await plaidClient.accountsGet({ access_token: accessToken });
    const account     = accountsRes.data.accounts[0];
    const institution = metadata?.institution?.name || "Bank";

    const card = new Card({
      userId:           req.user.id,
      color, colorFrom, colorTo,
      cardholderName:   institution,
      lastFour:         account?.mask || "????",
      bank:             institution,
      cardType:         account?.subtype || account?.type || "account",
      plaidAccessToken: accessToken,
      plaidItemId:      itemId,
      plaidAccountId:   account?.account_id,
    });

    const saved = await card.save();

    try {
      await syncCardTransactions(saved);
    } catch (syncErr) {
      console.error("Initial sync failed (non-fatal):", syncErr.message);
    }

    res.status(201).json({
      id:             saved._id,
      cardholderName: saved.cardholderName,
      lastFour:       saved.lastFour,
      bank:           saved.bank,
      cardType:       saved.cardType,
      color:          saved.color,
      colorFrom:      saved.colorFrom,
      colorTo:        saved.colorTo,
      connectedAt:    saved.createdAt,
    });
  } catch (error) {
    console.error("Plaid exchange error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to connect card via Plaid." });
  }
});

router.post("/sync/:cardId", verifyToken, async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card)                              return res.status(404).json({ message: "Card not found." });
    if (card.userId.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized." });
    if (!card.plaidItemId)                  return res.status(400).json({ message: "This card is not connected to Plaid." });

    const newCount = await syncCardTransactions(card);
    res.status(200).json({
      message:             `Sync complete. ${newCount} new transaction${newCount !== 1 ? "s" : ""} imported.`,
      newTransactionCount: newCount,
    });
  } catch (error) {
    console.error("Sync error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to sync transactions." });
  }
});

router.post("/webhook", async (req, res) => {
  res.status(200).json({ received: true });
  const { webhook_type, webhook_code, item_id } = req.body;
  if (
    webhook_type === "TRANSACTIONS" &&
    (webhook_code === "SYNC_UPDATES_AVAILABLE" || webhook_code === "DEFAULT_UPDATE")
  ) {
    try {
      const card = await Card.findOne({ plaidItemId: item_id });
      if (!card) return;
      const newCount = await syncCardTransactions(card);
      console.log(`Webhook sync for item ${item_id}: ${newCount} new transactions.`);
    } catch (err) {
      console.error("Webhook sync error:", err.message);
    }
  }
});

export default router;