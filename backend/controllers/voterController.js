const fs = require("fs");
const { validationResult } = require("express-validator");
const ExcelJS = require("exceljs");
const Voter = require("../models/Voter");
const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");
const { parseVotersFromExcel } = require("../utils/excel");
const { getElectionStatus, resolveElectionWinner } = require("../utils/status");

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

const normalizeAssigned = (assignedElections) => {
  if (!assignedElections) return [];
  if (Array.isArray(assignedElections)) return assignedElections;
  if (typeof assignedElections === "string") return assignedElections.split(",").map((v) => v.trim()).filter(Boolean);
  return [];
};

const getCellValue = (row, keys) => {
  for (const key of keys) {
    if (row[key] === undefined || row[key] === null) continue;
    const value = String(row[key]).trim();
    if (value) return value;
  }
  return "";
};

const getVoters = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { idno: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    const voters = await Voter.find(query)
      .populate("assignedElections", "name status startDate endDate")
      .sort({ createdAt: -1 });
    res.json(voters);
  } catch (error) {
    next(error);
  }
};

const createVoter = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;

    const { idno, name, email, phone } = req.body;
    const assigned = normalizeAssigned(req.body.assignedElections);
    const exists = await Voter.findOne({ idno: idno.trim() });
    if (exists) return res.status(409).json({ message: "Voter with this ID exists" });

    const voter = await Voter.create({
      idno: idno.trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      role: "voter",
      assignedElections: assigned
    });

    res.status(201).json({ message: "Voter created", voter });
  } catch (error) {
    next(error);
  }
};

const bulkImportVoters = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Excel file is required" });
    const selectedElectionIds = normalizeAssigned(req.body.assignedElections);
    if (!selectedElectionIds.length) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ message: "Please select at least one election for bulk import assignment" });
    }

    const validElections = await Election.find({ _id: { $in: selectedElectionIds } }).select("_id");
    const validElectionIds = validElections.map((e) => e._id.toString());
    if (!validElectionIds.length) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ message: "Selected elections are invalid" });
    }

    const rows = parseVotersFromExcel(req.file.path);

    const report = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const idno = getCellValue(row, ["idno", "ID", "IdNo", "ID No", "id no", "IDNO"]);
      const name = getCellValue(row, ["name", "Name"]);
      const email = getCellValue(row, ["email", "Email"]).toLowerCase();
      const phone = getCellValue(row, ["phone", "Phone"]);

      if (!idno || !name || !email || !phone) {
        report.skipped += 1;
        report.errors.push({ row: i + 2, message: "Missing required fields: idno, name, email, phone" });
        continue;
      }

      const exists = await Voter.findOne({ idno });
      if (exists) {
        await Voter.findByIdAndUpdate(exists._id, {
          $set: { role: "voter" },
          $addToSet: { assignedElections: { $each: validElectionIds } }
        });
        report.updated += 1;
        continue;
      }

      await Voter.create({
        idno,
        name,
        email,
        phone,
        role: "voter",
        assignedElections: validElectionIds
      });
      report.inserted += 1;
    }

    fs.unlink(req.file.path, () => {});
    res.status(201).json({ message: "Bulk import completed", report });
  } catch (error) {
    next(error);
  }
};

const updateVoter = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;
    const voter = await Voter.findById(req.params.id);
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    const { idno, name, email, phone } = req.body;
    const assigned = normalizeAssigned(req.body.assignedElections);

    if (idno) voter.idno = idno.trim();
    if (name) voter.name = name.trim();
    if (email) voter.email = email.toLowerCase().trim();
    if (phone) voter.phone = phone.trim();
    if (req.body.assignedElections !== undefined) voter.assignedElections = assigned;

    await voter.save();
    res.json({ message: "Voter updated", voter });
  } catch (error) {
    next(error);
  }
};

const deleteVoter = async (req, res, next) => {
  try {
    const voter = await Voter.findById(req.params.id);
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    await Vote.deleteMany({ voter: voter._id });
    await voter.deleteOne();
    res.json({ message: "Voter deleted" });
  } catch (error) {
    next(error);
  }
};

const getMyElections = async (req, res, next) => {
  try {
    const voter = await Voter.findById(req.voter._id).populate({
      path: "assignedElections",
      populate: { path: "candidates", model: "Candidate" }
    });
    const votedSet = new Set((voter.hasVoted || []).map((entry) => entry.election.toString()));

    const data = voter.assignedElections.map((e) => ({
      ...e.toObject(),
      status: getElectionStatus(e.startDate, e.endDate),
      hasVoted: votedSet.has(e._id.toString())
    }));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const getVoterResults = async (req, res, next) => {
  try {
    const voter = await Voter.findById(req.voter._id).populate("assignedElections");

    const completed = voter.assignedElections.filter(
      (e) => getElectionStatus(e.startDate, e.endDate) === "completed"
    );

    const resultPayload = [];
    for (const election of completed) {
      const candidates = await Candidate.find({ election: election._id }).sort({ votes: -1 });
      const outcome = resolveElectionWinner(candidates);
      const winner = outcome.winnerId
        ? candidates.find((candidate) => candidate._id.toString() === outcome.winnerId.toString()) || null
        : null;
      const myVote = await Vote.findOne({ voter: voter._id, election: election._id }).populate("candidate");

      resultPayload.push({
        election,
        candidates,
        winner,
        winnerReason: outcome.reason,
        myVote
      });
    }

    res.json(resultPayload);
  } catch (error) {
    next(error);
  }
};

const downloadVoterTemplate = async (_req, res, next) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Voters");
    sheet.columns = [
      { header: "idno", key: "idno", width: 18 },
      { header: "name", key: "name", width: 24 },
      { header: "email", key: "email", width: 30 },
      { header: "phone", key: "phone", width: 18 }
    ];
    sheet.addRow({
      idno: "VOTER001",
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890"
    });
    sheet.getRow(1).font = { bold: true };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=voter_template.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVoters,
  createVoter,
  bulkImportVoters,
  updateVoter,
  deleteVoter,
  getMyElections,
  getVoterResults,
  downloadVoterTemplate
};
