const { validationResult } = require("express-validator");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const Vote = require("../models/Vote");

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

const getCandidates = async (req, res, next) => {
  try {
    const { election, search } = req.query;
    const query = {};
    if (election) query.election = election;
    if (search) query.name = { $regex: search, $options: "i" };

    const candidates = await Candidate.find(query).populate("election").sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    next(error);
  }
};

const createCandidate = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;
    const { name, election, description } = req.body;

    const electionDoc = await Election.findById(election);
    if (!electionDoc) return res.status(404).json({ message: "Election not found" });

    const candidate = await Candidate.create({
      name: name.trim(),
      election,
      description: description.trim(),
      photo: req.file ? `/uploads/${req.file.filename}` : ""
    });

    electionDoc.candidates.push(candidate._id);
    await electionDoc.save();

    res.status(201).json({ message: "Candidate created", candidate });
  } catch (error) {
    next(error);
  }
};

const updateCandidate = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    const previousElectionId = candidate.election.toString();
    const { name, election, description } = req.body;

    if (name) candidate.name = name.trim();
    if (description) candidate.description = description.trim();
    if (req.file) candidate.photo = `/uploads/${req.file.filename}`;

    if (election && election !== previousElectionId) {
      const newElection = await Election.findById(election);
      if (!newElection) return res.status(404).json({ message: "Target election not found" });
      candidate.election = election;

      await Election.findByIdAndUpdate(previousElectionId, { $pull: { candidates: candidate._id } });
      await Election.findByIdAndUpdate(election, { $addToSet: { candidates: candidate._id } });
    }

    await candidate.save();
    res.json({ message: "Candidate updated", candidate });
  } catch (error) {
    next(error);
  }
};

const deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    await Election.findByIdAndUpdate(candidate.election, { $pull: { candidates: candidate._id } });
    await Vote.deleteMany({ candidate: candidate._id });
    await candidate.deleteOne();

    res.json({ message: "Candidate deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate
};

