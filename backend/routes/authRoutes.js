const express = require("express");
const { body } = require("express-validator");
const { adminLogin, voterLogin, logout, status } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/admin/login",
  [body("email").isEmail(), body("password").isLength({ min: 6 })],
  adminLogin
);
router.post(
  "/voter/login",
  [body("email").isEmail()],
  voterLogin
);
router.post("/logout", logout);
router.get("/status", status);

module.exports = router;

