import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Transaction from "./models/Transaction.js";

dotenv.config();

const randomAmount = (min, max) =>
  Number((Math.random() * (max - min) + min).toFixed(2));

const categories = [
  "Food",
  "Entertainment",
  "Utilities",
  "Transport",
  "Health",
  "Clothing",
  "Education"
];

const expenseRanges = {
  Food: [20, 150],
  Entertainment: [10, 100],
  Utilities: [50, 200],
  Transport: [5, 50],
  Health: [10, 120],
  Clothing: [30, 200],
  Education: [50, 300]
};

const expenseLabels = {
  Food: ["Restaurant", "Grocery Store", "Cafe"],
  Entertainment: ["Netflix", "Cinema", "Game"],
  Utilities: ["Electricity Bill", "Water Bill", "Internet"],
  Transport: ["Bus", "Taxi", "Fuel"],
  Health: ["Pharmacy", "Doctor"],
  Clothing: ["Online Shopping", "Mall"],
  Education: ["Course", "Book"]
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database for seeding...");

    const users = await User.find({});
    if (users.length === 0) {
      console.log("No users found. Please sign up first.");
      process.exit(0);
    }

    await Transaction.deleteMany({});
    console.log("Cleared existing transactions.");

    const transactionsData = [];

    users.forEach((user) => {
      const now = new Date();

      // Generate data for last 12 months
      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);

        // ✅ 1. Add salary (ALWAYS income)
        const salaryAmount = randomAmount(2000, 4000);

        transactionsData.push({
          userId: user._id,
          label: "Salary",
          category: "Income",
          amount: salaryAmount,
          sign: "income",
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5) // salary day
        });

        // ✅ 2. Add random expenses (5–15 per month)
        const numExpenses = Math.floor(Math.random() * 10) + 5;

        for (let j = 0; j < numExpenses; j++) {
          const category =
            categories[Math.floor(Math.random() * categories.length)];

          const [min, max] = expenseRanges[category];
          const labelList = expenseLabels[category];

          transactionsData.push({
            userId: user._id,
            label:
              labelList[Math.floor(Math.random() * labelList.length)],
            category,
            amount: randomAmount(min, max),
            sign: "expense",
            date: new Date(
              monthDate.getFullYear(),
              monthDate.getMonth(),
              Math.floor(Math.random() * 28) + 1 // random day
            )
          });
        }
      }
    });

    await Transaction.insertMany(transactionsData);

    console.log(
      `Seeded ${transactionsData.length} realistic transactions for ${users.length} users!`
    );

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();