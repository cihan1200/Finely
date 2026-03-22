import express from "express";
import PDFDocument from "pdfkit";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import ExportRecord from "../models/ExportRecord.js";
import { verifyToken } from "../middleware/auth.js";
import mongoose from "mongoose";

const router = express.Router();

// ── Date range helper ──────────────────────────────────────────────────────────

function getDateRange(range, from, to) {
  const now = new Date();

  switch (range) {
    case "this_month":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      };
    case "last_month":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 1),
      };
    case "last_3":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      };
    case "last_6":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 5, 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      };
    case "this_year":
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear() + 1, 0, 1),
      };
    case "custom":
      return {
        start: new Date(from),
        end: new Date(new Date(to).getTime() + 86_400_000),
      };
    default:
      return { start: new Date(0), end: new Date() };
  }
}

function getRangeLabel(range, from, to) {
  const labels = {
    this_month: "This month",
    last_month: "Last month",
    last_3: "Last 3 months",
    last_6: "Last 6 months",
    this_year: "This year",
  };
  if (range === "custom") return `${from} → ${to}`;
  return labels[range] ?? range;
}

// ── CSV helpers ────────────────────────────────────────────────────────────────

function escapeCsv(val) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
}

function rowsToCsv(headers, rows) {
  const head = headers.map(escapeCsv).join(",");
  const body = rows.map((r) => r.map(escapeCsv).join(",")).join("\n");
  return `${head}\n${body}`;
}

function transactionsToCsv(txs) {
  return rowsToCsv(
    ["Date", "Label", "Category", "Type", "Amount"],
    txs.map((t) => [
      new Date(t.date).toISOString().split("T")[0],
      t.label,
      t.category,
      t.sign,
      t.amount.toFixed(2),
    ])
  );
}

function budgetsToCsv(budgets) {
  return rowsToCsv(
    ["Category", "Label", "Limit", "Spent", "Remaining", "Status"],
    budgets.map((b) => [
      b.category,
      b.label,
      b.limit.toFixed(2),
      b.spent.toFixed(2),
      (b.limit - b.spent).toFixed(2),
      b.spent > b.limit ? "Over budget" : "On track",
    ])
  );
}

function analyticsToCsv(data) {
  return rowsToCsv(
    ["Metric", "Value"],
    [
      ["Total Income", data.totalIncome.toFixed(2)],
      ["Total Expenses", data.totalExpenses.toFixed(2)],
      ["Net Savings", data.netSavings.toFixed(2)],
      ["Savings Rate", `${data.savingsRate.toFixed(1)}%`],
      ["Transactions", data.transactionCount],
    ]
  );
}

// ── PDF builder ────────────────────────────────────────────────────────────────

function buildPdf(title, sections) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];

    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const BRAND = "#10b981";
    const GRAY = "#6b7280";
    const DARK = "#111827";
    const PAGE_W = doc.page.width - 100;

    doc.rect(0, 0, doc.page.width, 80).fill(BRAND);
    doc.fillColor("#ffffff").fontSize(22).font("Helvetica-Bold").text("finely", 50, 28);
    doc.fontSize(11).font("Helvetica").text(title, 50, 54);
    doc.moveDown(3);
    doc.fillColor(GRAY).fontSize(9)
      .text(`Generated on ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`, { align: "right" });
    doc.moveDown(1);

    sections.forEach(({ heading, rows, headers }) => {
      doc.fillColor(DARK).fontSize(13).font("Helvetica-Bold").text(heading);
      doc.moveTo(50, doc.y + 4).lineTo(50 + PAGE_W, doc.y + 4)
        .strokeColor(BRAND).lineWidth(2).stroke();
      doc.moveDown(0.6);

      if (headers?.length) {
        const colW = PAGE_W / headers.length;
        doc.rect(50, doc.y, PAGE_W, 18).fill("#f3f4f6");
        doc.fillColor(GRAY).fontSize(8).font("Helvetica-Bold");
        headers.forEach((h, ci) => {
          doc.text(h, 54 + ci * colW, doc.y - 14, { width: colW - 4, lineBreak: false });
        });
        doc.moveDown(0.4);
        doc.font("Helvetica").fontSize(9).fillColor(DARK);

        rows.forEach((row, ri) => {
          if (doc.y > doc.page.height - 100) doc.addPage();
          const rowY = doc.y;
          const colW = PAGE_W / row.length;
          if (ri % 2 === 0) doc.rect(50, rowY, PAGE_W, 16).fill("#f9fafb");
          doc.fillColor(DARK);
          row.forEach((cell, ci) => {
            doc.text(String(cell ?? ""), 54 + ci * colW, rowY + 3, {
              width: colW - 8, lineBreak: false, ellipsis: true,
            });
          });
          doc.moveDown(0.15);
        });
      } else {
        rows.forEach(([key, val]) => {
          if (doc.y > doc.page.height - 100) doc.addPage();
          doc.fillColor(GRAY).fontSize(9).font("Helvetica-Bold")
            .text(key, 50, doc.y, { continued: true, width: 180 });
          doc.fillColor(DARK).font("Helvetica").text(String(val ?? ""), { align: "right" });
        });
      }

      doc.moveDown(1.5);
    });

    doc.moveTo(50, doc.page.height - 40).lineTo(50 + PAGE_W, doc.page.height - 40)
      .strokeColor("#e5e7eb").lineWidth(1).stroke();
    doc.fillColor(GRAY).fontSize(8)
      .text("Exported by Finely — finely.app", 50, doc.page.height - 28, {
        align: "center", width: PAGE_W,
      });

    doc.end();
  });
}

// ── Data fetchers ──────────────────────────────────────────────────────────────

async function fetchTransactions(userId, start, end) {
  return Transaction.find({ userId, date: { $gte: start, $lt: end } }).sort({ date: -1 });
}

async function fetchBudgetsWithSpent(userId, start, end) {
  const budgets = await Budget.find({ userId });
  const spent = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), sign: "expense", date: { $gte: start, $lt: end } } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
  ]);
  const spentMap = {};
  spent.forEach(({ _id, total }) => { spentMap[_id] = total; });
  return budgets.map((b) => ({
    category: b.category, label: b.label,
    limit: b.limit, spent: spentMap[b.category] ?? 0,
  }));
}

async function fetchAnalyticsSummary(userId, start, end) {
  const txs = await Transaction.find({ userId, date: { $gte: start, $lt: end } });
  let totalIncome = 0, totalExpenses = 0;
  txs.forEach((t) => {
    if (t.sign === "income") totalIncome += t.amount;
    if (t.sign === "expense") totalExpenses += t.amount;
  });
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  return { totalIncome, totalExpenses, netSavings, savingsRate, transactionCount: txs.length };
}

// ── GET /export/history ────────────────────────────────────────────────────────

router.get("/history", verifyToken, async (req, res) => {
  try {
    const records = await ExportRecord.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(
      records.map((r) => ({
        id: r._id,
        format: r.format,
        dataType: r.dataType,
        range: r.range,
        date: r.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch export history", error: err.message });
  }
});

// ── GET /export ────────────────────────────────────────────────────────────────

router.get("/", verifyToken, async (req, res) => {
  try {
    const { format = "csv", dataType = "transactions", range = "this_month", from, to } = req.query;
    const { start, end } = getDateRange(range, from, to);
    const userId = req.user.id;

    let transactions = [];
    let budgets = [];
    let analytics = null;

    if (dataType === "transactions" || dataType === "all") {
      transactions = await fetchTransactions(userId, start, end);
    }
    if (dataType === "budgets" || dataType === "all") {
      budgets = await fetchBudgetsWithSpent(userId, start, end);
    }
    if (dataType === "analytics" || dataType === "all") {
      analytics = await fetchAnalyticsSummary(userId, start, end);
    }

    const rangeLabel = getRangeLabel(range, from, to);
    const rangeFilename = `${start.toISOString().split("T")[0]}_${new Date(end.getTime() - 1).toISOString().split("T")[0]}`;

    // ── JSON ──
    if (format === "json") {
      const payload = {};
      if (transactions.length) payload.transactions = transactions.map((t) => ({
        id: t._id, date: t.date.toISOString().split("T")[0],
        label: t.label, category: t.category, type: t.sign, amount: t.amount,
      }));
      if (budgets.length) payload.budgets = budgets;
      if (analytics) payload.analytics = analytics;
      payload.exportedAt = new Date().toISOString();
      payload.period = rangeLabel;

      await ExportRecord.create({ userId, format, dataType, range: rangeLabel });

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="finely_${dataType}_${rangeFilename}.json"`);
      return res.json(payload);
    }

    // ── CSV ──
    if (format === "csv") {
      let csv = `# Finely Export — ${dataType} — ${rangeLabel}\n\n`;
      if (transactions.length) {
        if (dataType === "all") csv += "## Transactions\n";
        csv += transactionsToCsv(transactions) + "\n\n";
      }
      if (budgets.length) {
        if (dataType === "all") csv += "## Budgets\n";
        csv += budgetsToCsv(budgets) + "\n\n";
      }
      if (analytics) {
        if (dataType === "all") csv += "## Analytics Summary\n";
        csv += analyticsToCsv(analytics) + "\n";
      }

      await ExportRecord.create({ userId, format, dataType, range: rangeLabel });

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="finely_${dataType}_${rangeFilename}.csv"`);
      return res.send(csv);
    }

    // ── PDF ──
    if (format === "pdf") {
      const sections = [];

      if (transactions.length) {
        sections.push({
          heading: "Transactions",
          headers: ["Date", "Label", "Category", "Type", "Amount ($)"],
          rows: transactions.map((t) => [
            new Date(t.date).toISOString().split("T")[0],
            t.label, t.category, t.sign, t.amount.toFixed(2),
          ]),
        });
      }
      if (budgets.length) {
        sections.push({
          heading: "Budgets",
          headers: ["Category", "Label", "Limit ($)", "Spent ($)", "Remaining ($)", "Status"],
          rows: budgets.map((b) => [
            b.category, b.label, b.limit.toFixed(2), b.spent.toFixed(2),
            (b.limit - b.spent).toFixed(2), b.spent > b.limit ? "Over" : "On track",
          ]),
        });
      }
      if (analytics) {
        sections.push({
          heading: "Analytics Summary",
          rows: [
            ["Total Income", `$${analytics.totalIncome.toFixed(2)}`],
            ["Total Expenses", `$${analytics.totalExpenses.toFixed(2)}`],
            ["Net Savings", `$${analytics.netSavings.toFixed(2)}`],
            ["Savings Rate", `${analytics.savingsRate.toFixed(1)}%`],
            ["Transactions", analytics.transactionCount],
          ],
        });
      }

      const pdfTitle = `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Report — ${rangeLabel}`;
      const pdfBuffer = await buildPdf(pdfTitle, sections);

      await ExportRecord.create({ userId, format, dataType, range: rangeLabel });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="finely_${dataType}_${rangeFilename}.pdf"`);
      res.setHeader("Content-Length", pdfBuffer.length);
      return res.send(pdfBuffer);
    }

    res.status(400).json({ message: "Unsupported format. Use csv, json, or pdf." });
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ message: "Export failed", error: err.message });
  }
});

export default router;