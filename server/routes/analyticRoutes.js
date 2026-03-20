import express from "express";
import Transaction from "../models/Transaction.js";
import { verifyToken } from "../middleware/auth.js";
import mongoose from "mongoose";

const router = express.Router();

// GET analytics summary (Avg income, expenses, etc.)
router.get("/summary", verifyToken, async (req, res) => {
  try {
    // 1. Get period from query, default to 6 if not provided
    const period = parseInt(req.query.period) || 6;

    // 2. Define dynamic time periods
    const now = new Date();
    const currentPeriodStart = new Date(now.getFullYear(), now.getMonth() - (period - 1), 1);
    const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - ((period * 2) - 1), 1);

    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: previousPeriodStart }
    });

    const currentTxs = transactions.filter(tx => tx.date >= currentPeriodStart);
    const prevTxs = transactions.filter(tx => tx.date >= previousPeriodStart && tx.date < currentPeriodStart);

    const calculateStats = (txs) => {
      let income = 0;
      let expenses = 0;

      txs.forEach(tx => {
        if (tx.sign === "income") income += tx.amount;
        if (tx.sign === "expense") expenses += tx.amount;
      });

      const totalSaved = income - expenses;
      const savingsRate = income > 0 ? (totalSaved / income) * 100 : 0;

      return {
        avgIncome: income / period,       // Dynamically divide by period
        avgExpenses: expenses / period,   // Dynamically divide by period
        totalSaved: totalSaved,
        savingsRate: savingsRate
      };
    };

    const currentStats = calculateStats(currentTxs);
    const prevStats = calculateStats(prevTxs);

    const calcPercentDelta = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const responseData = {
      avgIncome: currentStats.avgIncome,
      avgIncomeDelta: calcPercentDelta(currentStats.avgIncome, prevStats.avgIncome),
      avgExpenses: currentStats.avgExpenses,
      avgExpensesDelta: calcPercentDelta(currentStats.avgExpenses, prevStats.avgExpenses),
      savingsRate: currentStats.savingsRate,
      savingsRateDelta: currentStats.savingsRate - prevStats.savingsRate,
      totalSaved: currentStats.totalSaved,
      totalSavedDelta: currentStats.totalSaved - prevStats.totalSaved
    };

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
  }
});

// GET expenses grouped by category
router.get("/expenses-by-category", verifyToken, async (req, res) => {
  try {
    const period = parseInt(req.query.period) || 6;
    const now = new Date();
    const currentPeriodStart = new Date(now.getFullYear(), now.getMonth() - (period - 1), 1);

    // Apply the date filter so it doesn't fetch ALL expenses from all time
    const expenses = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          sign: { $in: ["expense", "Expense"] },
          date: { $gte: currentPeriodStart }
        }
      },
      {
        $group: {
          _id: "$category",
          amount: { $sum: "$amount" }
        }
      },
      {
        $project: {
          category: { $ifNull: ["$_id", "Other"] },
          amount: 1,
          _id: 0
        }
      },
      {
        $sort: { amount: -1 }
      }
    ]);

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch category expenses", error: error.message });
  }
});

// GET monthly trend (Income, Expenses, Savings over dynamic period)
router.get("/monthly-trend", verifyToken, async (req, res) => {
  try {
    // 1. Get period from query, default to 6
    const period = parseInt(req.query.period) || 6;
    const now = new Date();

    // Start of the month 'period - 1' months ago
    const periodStart = new Date(now.getFullYear(), now.getMonth() - (period - 1), 1);

    const transactions = await Transaction.find({
      userId: new mongoose.Types.ObjectId(req.user.id),
      date: { $gte: periodStart }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendMap = new Map();

    // 2. Initialize map with the correct number of dynamic months
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;

      trendMap.set(key, {
        month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        income: 0,
        expenses: 0,
        savings: 0
      });
    }

    // 3. Aggregate transaction amounts (FIXED with year + month key)
    transactions.forEach(tx => {
      const key = `${tx.date.getFullYear()}-${tx.date.getMonth()}`;

      if (trendMap.has(key)) {
        const data = trendMap.get(key);

        if (tx.sign === "income") {
          data.income += tx.amount;
          data.savings += tx.amount;
        } else if (tx.sign === "expense") {
          data.expenses += tx.amount;
          data.savings -= tx.amount;
        }
      }
    });

    const result = Array.from(trendMap.values());
    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch monthly trend", error: error.message });
  }
});

// GET /analytic/dashboard — current month overview + vs last month deltas + all-time balance
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const now = new Date();

    // Current month window
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Previous month window
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = currentStart;

    const allTransactions = await Transaction.find({ userId: req.user.id });

    const currentTxs = allTransactions.filter(tx => tx.date >= currentStart && tx.date < currentEnd);
    const prevTxs = allTransactions.filter(tx => tx.date >= prevStart && tx.date < prevEnd);

    const calcMonthStats = (txs) => {
      let income = 0;
      let expenses = 0;
      txs.forEach(tx => {
        if (tx.sign === "income") income += tx.amount;
        if (tx.sign === "expense") expenses += tx.amount;
      });
      const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
      return { income, expenses, savingsRate };
    };

    const current = calcMonthStats(currentTxs);
    const prev = calcMonthStats(prevTxs);

    // All-time balance
    let totalBalance = 0;
    allTransactions.forEach(tx => {
      if (tx.sign === "income") totalBalance += tx.amount;
      if (tx.sign === "expense") totalBalance -= tx.amount;
    });

    const calcDelta = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    res.status(200).json({
      totalBalance,
      currentMonthIncome: current.income,
      currentMonthExpenses: current.expenses,
      currentMonthSavingsRate: current.savingsRate,
      incomeDelta: calcDelta(current.income, prev.income),
      expensesDelta: calcDelta(current.expenses, prev.expenses),
      savingsRateDelta: current.savingsRate - prev.savingsRate,
      balanceDelta: calcDelta(totalBalance, totalBalance - (current.income - current.expenses))
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard data", error: error.message });
  }
});

export default router;