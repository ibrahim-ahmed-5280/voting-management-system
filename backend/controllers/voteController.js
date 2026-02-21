const Vote = require("../models/Vote");
const Voter = require("../models/Voter");
const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const { buildVotesWorkbook } = require("../utils/excel");
const { getElectionStatus } = require("../utils/status");

const getVotes = async (req, res, next) => {
  try {
    const { election, from, to, search } = req.query;
    const query = {};

    if (election) query.election = election;
    if (from || to) {
      query.votedAt = {};
      if (from) query.votedAt.$gte = new Date(from);
      if (to) query.votedAt.$lte = new Date(to);
    }

    let votes = await Vote.find(query)
      .populate("voter", "name email")
      .populate("election", "name")
      .populate("candidate", "name")
      .sort({ votedAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      votes = votes.filter((v) => {
        const name = v.voter?.name?.toLowerCase() || "";
        const email = v.voter?.email?.toLowerCase() || "";
        return name.includes(s) || email.includes(s);
      });
    }

    res.json(votes);
  } catch (error) {
    next(error);
  }
};

const castVote = async (req, res, next) => {
  try {
    const { election: electionId, candidate: candidateId } = req.body;
    if (!electionId || !candidateId) {
      return res.status(400).json({ message: "Election and candidate are required" });
    }

    const voter = await Voter.findById(req.voter._id);
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    const isAssigned = voter.assignedElections.some((id) => id.toString() === electionId);
    if (!isAssigned) return res.status(403).json({ message: "Voter not assigned to this election" });

    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: "Election not found" });

    const status = getElectionStatus(election.startDate, election.endDate);
    if (status !== "ongoing") {
      return res.status(400).json({ message: `Election is ${status}. Voting is only allowed during ongoing elections.` });
    }

    const candidate = await Candidate.findOne({ _id: candidateId, election: electionId });
    if (!candidate) return res.status(404).json({ message: "Candidate not found in this election" });

    const existing = await Vote.findOne({ voter: voter._id, election: electionId });
    if (existing) return res.status(409).json({ message: "You have already voted in this election" });

    const vote = await Vote.create({
      voter: voter._id,
      election: electionId,
      candidate: candidateId,
      ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "",
      userAgent: req.headers["user-agent"] || ""
    });

    candidate.votes += 1;
    election.totalVotes += 1;
    voter.hasVoted.push({ election: election._id, candidate: candidate._id, votedAt: new Date() });

    await candidate.save();
    await election.save();
    await voter.save();

    res.status(201).json({ message: "Vote cast successfully", vote });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate vote detected" });
    }
    next(error);
  }
};

const deleteVote = async (req, res, next) => {
  try {
    const vote = await Vote.findById(req.params.id);
    if (!vote) return res.status(404).json({ message: "Vote not found" });

    await Candidate.findByIdAndUpdate(vote.candidate, { $inc: { votes: -1 } });
    await Election.findByIdAndUpdate(vote.election, { $inc: { totalVotes: -1 } });
    await Voter.findByIdAndUpdate(vote.voter, { $pull: { hasVoted: { election: vote.election } } });
    await vote.deleteOne();

    res.json({ message: "Vote deleted" });
  } catch (error) {
    next(error);
  }
};

const downloadVotes = async (req, res, next) => {
  try {
    const votes = await Vote.find()
      .populate("voter", "name email")
      .populate("election", "name")
      .populate("candidate", "name")
      .sort({ votedAt: -1 });

    const workbook = await buildVotesWorkbook(votes);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=votes_report.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVotes,
  castVote,
  deleteVote,
  downloadVotes
};

