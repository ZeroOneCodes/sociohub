require("dotenv").config();
const express = require("express");
const router = express.Router();
const PostController = require("./controller");
const upload = require("./fileStorage");

router.post("/post/all",upload.single('media'), PostController.postAll);

module.exports = router;
