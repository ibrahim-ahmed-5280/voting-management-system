const Election = require("../models/Election");
const Candidate = require("../models/Candidate");

const getElectionStatus = (startDate, endDate, now = new Date()) => {
  if (now < new Date(startDate)) return "upcoming";
  if (now > new Date(endDate)) return "completed";
  return "ongoing";
};

const resolveElectionWinner = (candidates = []) => {
  if (!candidates.length) {
    return { winnerId: null, reason: "no_candidates" };
  }

  const ranked = [...candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const topVotes = ranked[0].votes || 0;
  if (topVotes <= 0) {
    return { winnerId: null, reason: "no_votes" };
  }

  const topCount = ranked.filter((candidate) => (candidate.votes || 0) === topVotes).length;
  if (topCount !== 1) {
    return { winnerId: null, reason: "tie" };
  }

  return { winnerId: ranked[0]._id, reason: "clear" };
};

const refreshElectionStatuses = async () => {
  const elections = await Election.find();
  const now = new Date();

  await Promise.all(
    elections.map(async (election) => {
      const nextStatus = getElectionStatus(election.startDate, election.endDate, now);
      if (election.status !== nextStatus) {
        election.status = nextStatus;
      }

      if (nextStatus === "completed") {
        const candidates = await Candidate.find({ election: election._id }).select("_id votes");
        const outcome = resolveElectionWinner(candidates);
        election.winner = outcome.winnerId;
      } else {
        election.winner = null;
      }

      await election.save();
    })
  );
};

module.exports = {
  getElectionStatus,
  resolveElectionWinner,
  refreshElectionStatuses
};

