const express = require("express");
const router = express.Router();
const WorkingController = require("./controler");
const { verifyAccessToken } = require("../auth/middleware");

router.get("/working", verifyAccessToken, WorkingController.getWorking);

module.exports = router;