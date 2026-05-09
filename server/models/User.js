import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  firstName: String,
  lastName: String,
  setupComplete: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);
export default User;
