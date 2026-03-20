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

app.use("/auth", authRoutes);
app.use("/transaction", transactionRoutes);
app.use("/analytic", analyticRoutes);
app.use("/budget", budgetRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});