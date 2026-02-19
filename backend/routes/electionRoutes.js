const express = require("express");
const { body } = require("express-validator");
const {
  getElections,
  getElectionById,
  createElection,
  updateElection,
  deleteElection
} = require("../controllers/electionController");
const { ensureAuthenticated, ensureAdmin } = require("../middleware/auth");
const { imageUpload } = require("../middleware/upload");

const router = express.Router();

router.get("/", ensureAuthenticated, getElections);
router.get("/:id", ensureAuthenticated, getElectionById);
router.post(
  "/",
  ensureAuthenticated,
  ensureAdmin,
  imageUpload.single("photo"),
  [body("name").notEmpty(), body("description").notEmpty(), body("startDate").notEmpty(), body("endDate").notEmpty()],
  createElection
);
router.put(
  "/:id",
  ensureAuthenticated,
  ensureAdmin,
  imageUpload.single("photo"),
  [
    body("name").optional().notEmpty(),
    body("description").optional().notEmpty(),
    body("startDate").optional().notEmpty(),
    body("endDate").optional().notEmpty()
  ],
  updateElection
);
router.delete("/:id", ensureAuthenticated, ensureAdmin, deleteElection);

module.exports = router;

