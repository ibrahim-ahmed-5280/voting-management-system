const Admin = require("../models/Admin");
const Voter = require("../models/Voter");

const ensureAuthenticated = (req, res, next) => {
  if (!req.session?.userId || !req.session?.role || !req.session?.sessionToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};

const ensureAdmin = async (req, res, next) => {
  if (req.session?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  const admin = await Admin.findById(req.session.userId);
  if (!admin || admin.activeSession !== req.session.sessionToken) {
    req.session.destroy(() => {});
    return res.status(401).json({ message: "Session invalidated by another login" });
  }
  req.admin = admin;
  return next();
};

const ensureVoter = async (req, res, next) => {
  if (req.session?.role !== "voter") {
    return res.status(403).json({ message: "Voter access required" });
  }

  const voter = await Voter.findById(req.session.userId);
  if (!voter || voter.activeSession !== req.session.sessionToken) {
    req.session.destroy(() => {});
    return res.status(401).json({ message: "Session invalidated by another login" });
  }
  req.voter = voter;
  return next();
};

module.exports = {
  ensureAuthenticated,
  ensureAdmin,
  ensureVoter
};

