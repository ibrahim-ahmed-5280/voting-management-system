const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    election: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
    photo: { type: String, default: "" },
    description: { type: String, required: true, trim: true },
    votes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);

