import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Transaction from "./models/Transaction.js";

dotenv.config();

const randomAmount = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database for seeding...");

    const users = await User.find({});
    if (users.length === 0) {
      console.log("No users found. Please sign up at least one user via the app first.");
      process.exit(0);
    }

    await Transaction.deleteMany({});
    console.log("Cleared existing transactions.");

    const categories = ["Income", "Entertainment", "Food", "Utilities", "Transport", "Health", "Clothing", "Education"];
    const labels = ["Grocery Store", "Salary", "Netflix", "Electricity Bill", "Bus Ticket", "Pharmacy", "Online Shopping", "Course Subscription"];

    const transactionsData = [];

    users.forEach((user) => {
      const numTransactions = Math.floor(Math.random() * 6) + 5;

      for (let i = 0; i < numTransactions; i++) {
        const isIncome = Math.random() > 0.7;

        transactionsData.push({
          userId: user._id,
          label: labels[Math.floor(Math.random() * labels.length)],
          category: categories[Math.floor(Math.random() * categories.length)],
          amount: randomAmount(10, 800),
          sign: isIncome ? "income" : "expense",
          date: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
        });
      }
    });

    await Transaction.insertMany(transactionsData);
    console.log(`Successfully seeded ${transactionsData.length} transactions for ${users.length} users!`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();