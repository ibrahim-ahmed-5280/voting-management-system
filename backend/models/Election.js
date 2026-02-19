const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    photo: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ["upcoming", "ongoing", "completed"], default: "upcoming" },
    candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Candidate" }],
    totalVotes: { type: Number, default: 0 },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Election", electionSchema);

