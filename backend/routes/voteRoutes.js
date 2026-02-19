const express = require("express");
const {
  getVotes,
  castVote,
  deleteVote,
  downloadVotes
} = require("../controllers/voteController");
const { ensureAuthenticated, ensureAdmin, ensureVoter } = require("../middleware/auth");

const router = express.Router();

router.get("/", ensureAuthenticated, ensureAdmin, getVotes);
router.post("/", ensureAuthenticated, ensureVoter, castVote);
router.delete("/:id", ensureAuthenticated, ensureAdmin, deleteVote);
router.get("/download", ensureAuthenticated, ensureAdmin, downloadVotes);

module.exports = router;

