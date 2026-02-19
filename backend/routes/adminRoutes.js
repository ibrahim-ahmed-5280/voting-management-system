const express = require("express");
const { body } = require("express-validator");
const {
  registerAdmin,
  getProfile,
  updateProfile,
  uploadProfileImage
} = require("../controllers/adminController");
const { ensureAuthenticated, ensureAdmin } = require("../middleware/auth");
const { imageUpload } = require("../middleware/upload");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 })
  ],
  registerAdmin
);

router.get("/profile", ensureAuthenticated, ensureAdmin, getProfile);
router.put(
  "/profile",
  ensureAuthenticated,
  ensureAdmin,
  [
    body("email").optional().isEmail(),
    body("newPassword").optional().isLength({ min: 6 })
  ],
  updateProfile
);
router.post(
  "/profile/image",
  ensureAuthenticated,
  ensureAdmin,
  imageUpload.single("image"),
  uploadProfileImage
);

module.exports = router;

