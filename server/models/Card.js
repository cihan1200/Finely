import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    color:     { type: String, required: true, default: "slate" },
    colorFrom: { type: String, required: true },
    colorTo:   { type: String, required: true },

    cardholderName: { type: String, default: "" },
    lastFour:       { type: String, default: "" },
    bank:           { type: String, default: "" },
    cardType:       { type: String, default: "" },

    plaidAccessToken: { type: String, default: null, select: false },
    plaidItemId:      { type: String, default: null },
    plaidAccountId:   { type: String, default: null },

    plaidCursor:      { type: String, default: null, select: false },
  },
  { timestamps: true }
);

cardSchema.index({ userId: 1 });
cardSchema.index({ userId: 1, plaidItemId: 1 }, { unique: true, sparse: true });

const Card = mongoose.model("Card", cardSchema);
export default Card;