const express = require("express");
const { contactUs } = require("../controllers/contactusController");
const protect = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", protect, contactUs);
module.exports = router;
