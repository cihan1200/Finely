import mongoose from "mongoose";

const exportRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    format: { type: String, enum: ["csv", "json", "pdf"], required: true },
    dataType: { type: String, required: true },
    range: { type: String, required: true },
  },
  { timestamps: true }
);

const ExportRecord = mongoose.model("ExportRecord", exportRecordSchema);
export default ExportRecord;