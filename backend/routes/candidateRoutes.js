const express = require("express");
const { body } = require("express-validator");
const {
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate
} = require("../controllers/candidateController");
const { ensureAuthenticated, ensureAdmin } = require("../middleware/auth");
const { imageUpload } = require("../middleware/upload");

const router = express.Router();

router.get("/", ensureAuthenticated, getCandidates);
router.post(
  "/",
  ensureAuthenticated,
  ensureAdmin,
  imageUpload.single("photo"),
  [body("name").notEmpty(), body("election").notEmpty(), body("description").notEmpty()],
  createCandidate
);
router.put(
  "/:id",
  ensureAuthenticated,
  ensureAdmin,
  imageUpload.single("photo"),
  [
    body("name").optional().notEmpty(),
    body("election").optional().notEmpty(),
    body("description").optional().notEmpty()
  ],
  updateCandidate
);
router.delete("/:id", ensureAuthenticated, ensureAdmin, deleteCandidate);

module.exports = router;

