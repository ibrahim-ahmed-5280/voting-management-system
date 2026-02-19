const { validationResult } = require("express-validator");
const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");
const { getElectionStatus } = require("../utils/status");

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

const withStatus = (election) => {
  const doc = election.toObject ? election.toObject() : election;
  return {
    ...doc,
    status: getElectionStatus(doc.startDate, doc.endDate)
  };
};

const parseDateValue = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const getElections = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const elections = await Election.find(query).populate("candidates").sort({ createdAt: -1 });
    const mapped = elections.map(withStatus).filter((e) => (!status ? true : e.status === status));
    res.json(mapped);
  } catch (error) {
    next(error);
  }
};

const getElectionById = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id).populate("candidates winner");
    if (!election) return res.status(404).json({ message: "Election not found" });
    election.status = getElectionStatus(election.startDate, election.endDate);
    await election.save();
    res.json(election);
  } catch (error) {
    next(error);
  }
};

const createElection = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;
    const { name, startDate, endDate, description } = req.body;
    const parsedStartDate = parseDateValue(startDate);
    const parsedEndDate = parseDateValue(endDate);

    if (!parsedStartDate || !parsedEndDate) {
      return res.status(400).json({ message: "Invalid start or end date" });
    }

    if (parsedStartDate >= parsedEndDate) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const election = await Election.create({
      name: name.trim(),
      photo: req.file ? `/uploads/${req.file.filename}` : "",
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      description: description.trim(),
      status: getElectionStatus(parsedStartDate, parsedEndDate)
    });

    res.status(201).json({ message: "Election created", election });
  } catch (error) {
    next(error);
  }
};

const updateElection = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: "Election not found" });

    const { name, startDate, endDate, description } = req.body;
    const parsedStartDate = startDate ? parseDateValue(startDate) : election.startDate;
    const parsedEndDate = endDate ? parseDateValue(endDate) : election.endDate;

    if (!parsedStartDate || !parsedEndDate) {
      return res.status(400).json({ message: "Invalid start or end date" });
    }

    if (name) election.name = name.trim();
    if (description) election.description = description.trim();
    if (startDate) election.startDate = parsedStartDate;
    if (endDate) election.endDate = parsedEndDate;
    if (req.file) election.photo = `/uploads/${req.file.filename}`;

    if (parsedStartDate >= parsedEndDate) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    election.status = getElectionStatus(parsedStartDate, parsedEndDate);
    await election.save();
    res.json({ message: "Election updated", election });
  } catch (error) {
    next(error);
  }
};

const deleteElection = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: "Election not found" });

    await Candidate.deleteMany({ election: election._id });
    await Vote.deleteMany({ election: election._id });
    await election.deleteOne();

    res.json({ message: "Election deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getElections,
  getElectionById,
  createElection,
  updateElection,
  deleteElection
};

