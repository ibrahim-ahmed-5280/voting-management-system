const mongoose = require("mongoose");

const votedElectionSchema = new mongoose.Schema(
  {
    election: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    votedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const voterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ["voter"], default: "voter" },
    phone: { type: String, required: true, trim: true },
    assignedElections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Election" }],
    hasVoted: [votedElectionSchema],
    activeSession: { type: String, default: null },
    lastLogin: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voter", voterSchema);
