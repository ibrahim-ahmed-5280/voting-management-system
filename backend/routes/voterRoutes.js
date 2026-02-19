const express = require("express");
const { body } = require("express-validator");
const {
  getVoters,
  createVoter,
  bulkImportVoters,
  updateVoter,
  deleteVoter,
  getMyElections,
  getVoterResults,
  downloadVoterTemplate
} = require("../controllers/voterController");
const { ensureAuthenticated, ensureAdmin, ensureVoter } = require("../middleware/auth");
const { excelUpload } = require("../middleware/upload");

const router = express.Router();

router.get("/", ensureAuthenticated, ensureAdmin, getVoters);
router.post(
  "/",
  ensureAuthenticated,
  ensureAdmin,
  [body("idno").notEmpty(), body("name").notEmpty(), body("email").isEmail(), body("phone").notEmpty()],
  createVoter
);
router.post("/bulk", ensureAuthenticated, ensureAdmin, excelUpload.single("file"), bulkImportVoters);
router.put(
  "/:id",
  ensureAuthenticated,
  ensureAdmin,
  [body("email").optional().isEmail()],
  updateVoter
);
router.delete("/:id", ensureAuthenticated, ensureAdmin, deleteVoter);
router.get("/template/download", ensureAuthenticated, ensureAdmin, downloadVoterTemplate);

router.get("/my-elections", ensureAuthenticated, ensureVoter, getMyElections);
router.get("/results", ensureAuthenticated, ensureVoter, getVoterResults);

module.exports = router;
