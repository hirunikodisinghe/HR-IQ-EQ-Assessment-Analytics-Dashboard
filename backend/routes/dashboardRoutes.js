const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getIQResults,
  getHQResults,
  getRecruitmentPerformance,
} = require("../controllers/dashboardController");

router.get("/iq-results", authMiddleware, getIQResults);
router.get("/hq-results", authMiddleware, getHQResults);
router.get(
  "/recruitment-performance",
  authMiddleware,
  getRecruitmentPerformance
);

module.exports = router;