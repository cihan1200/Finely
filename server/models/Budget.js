import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    label: { type: String, required: true },
    category: { type: String, required: true }, // Matches transaction category exactly
    icon: { type: String, required: true },
    color: { type: String, required: true },
    limit: { type: Number, required: true }
  },
  { timestamps: true }
);

const Budget = mongoose.model("Budget", budgetSchema);
export default Budget;
