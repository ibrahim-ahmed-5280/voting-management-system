const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const Admin = require("../models/Admin");
const Voter = require("../models/Voter");

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

const adminLogin = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const inputPassword = String(password || "");
    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(inputPassword, admin.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const sessionToken = uuidv4();
    admin.activeSession = sessionToken;
    admin.lastLogin = new Date();
    await admin.save();

    req.session.userId = admin._id.toString();
    req.session.role = "admin";
    req.session.sessionToken = sessionToken;

    res.json({
      message: "Admin login successful",
      user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role, profileImage: admin.profileImage }
    });
  } catch (error) {
    next(error);
  }
};

const voterLogin = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;
    const { email } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const matchedVoters = await Voter.find({ email: normalizedEmail }).limit(2);
    if (!matchedVoters.length) return res.status(401).json({ message: "Invalid voter credentials" });
    if (matchedVoters.length > 1) {
      return res.status(409).json({ message: "Duplicate voter email detected. Please contact administrator." });
    }
    const voter = matchedVoters[0];

    const sessionToken = uuidv4();
    voter.activeSession = sessionToken;
    voter.lastLogin = new Date();
    await voter.save();

    req.session.userId = voter._id.toString();
    req.session.role = "voter";
    req.session.sessionToken = sessionToken;

    res.json({
      message: "Voter login successful",
      user: { id: voter._id, name: voter.name, email: voter.email, role: voter.role }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.session?.userId && req.session?.role) {
      if (req.session.role === "admin") {
        await Admin.findByIdAndUpdate(req.session.userId, { $set: { activeSession: null } });
      }
      if (req.session.role === "voter") {
        await Voter.findByIdAndUpdate(req.session.userId, { $set: { activeSession: null } });
      }
    }

    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("ems.sid");
      return res.json({ message: "Logged out" });
    });
  } catch (error) {
    next(error);
  }
};

const status = async (req, res, next) => {
  try {
    if (!req.session?.userId || !req.session?.role || !req.session?.sessionToken) {
      return res.json({ authenticated: false });
    }

    if (req.session.role === "admin") {
      const admin = await Admin.findById(req.session.userId);
      if (!admin || admin.activeSession !== req.session.sessionToken) {
        return res.json({ authenticated: false });
      }
      return res.json({
        authenticated: true,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          profileImage: admin.profileImage
        }
      });
    }

    const voter = await Voter.findById(req.session.userId);
    if (!voter || voter.activeSession !== req.session.sessionToken) {
      return res.json({ authenticated: false });
    }
    return res.json({
      authenticated: true,
      user: { id: voter._id, name: voter.name, email: voter.email, role: voter.role }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  voterLogin,
  logout,
  status
};
