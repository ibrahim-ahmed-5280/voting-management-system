const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
    profileImage: { type: String, default: "" },
    activeSession: { type: String, default: null },
    lastLogin: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
