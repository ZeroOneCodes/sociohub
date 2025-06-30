const express = require("express");
const router = express.Router();
const WorkingController = require("./controller");
const { verifyAccessToken } = require("../auth/middleware");

router.get("/working", verifyAccessToken, WorkingController.getWorking);

module.exports = router;