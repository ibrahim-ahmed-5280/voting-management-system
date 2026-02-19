const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const Admin = require("../models/Admin");

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

const registerAdmin = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;
    const { name, email, password } = req.body;

    const exists = await Admin.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Admin already exists" });

    const hash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hash,
      role: "admin"
    });

    res.status(201).json({
      message: "Admin registered successfully",
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");
    res.json(admin);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;
    const { name, email, currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin._id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (name) admin.name = name.trim();
    if (email) admin.email = email.toLowerCase();

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      const validCurrent = await bcrypt.compare(currentPassword, admin.password);
      if (!validCurrent) return res.status(401).json({ message: "Current password is incorrect" });
      admin.password = await bcrypt.hash(newPassword, 10);
    }

    await admin.save();
    res.json({
      message: "Profile updated",
      admin: { id: admin._id, name: admin.name, email: admin.email, profileImage: admin.profileImage }
    });
  } catch (error) {
    next(error);
  }
};

const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image file is required" });
    const admin = await Admin.findById(req.admin._id);
    admin.profileImage = `/uploads/${req.file.filename}`;
    await admin.save();
    res.json({ message: "Profile image updated", profileImage: admin.profileImage });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerAdmin,
  getProfile,
  updateProfile,
  uploadProfileImage
};
