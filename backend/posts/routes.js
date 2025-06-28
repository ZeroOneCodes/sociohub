require("dotenv").config();
const express = require("express");
const router = express.Router();
const PostController = require("./controller");

router.post("/post/all", PostController.postAll);

module.exports = router;
