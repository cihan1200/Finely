import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import analyticRoutes from "./routes/analyticRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected");
  } catch (error) {
    console.error(error);
  }
}
connectDb();

app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  if (dbState === 1) {
    return res.status(200).json({ status: "ok", db: "connected" });
  }
  return res.status(503).json({ status: "starting", db: "connecting" });
});

app.get("/wake", (_req, res) => {
  const frontend = process.env.FRONTEND_URL;
  if (!frontend) {
    return res.status(500).send("FRONTEND_URL environment variable is not set.");
  }
  res.redirect(frontend);
});

app.use("/auth", authRoutes);
app.use("/transaction", transactionRoutes);
app.use("/analytic", analyticRoutes);
app.use("/budget", budgetRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});