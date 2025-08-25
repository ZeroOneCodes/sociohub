require("dotenv").config();
const express = require("express");
const router = express.Router();
const PostController = require("./controller");
const { upload, handleMulterError } = require("./fileStorage");

router.post(
  "/post/all",
  upload.array("media", 4),
  handleMulterError,
  PostController.postAll
);
router.post("/deleteTweet/:id", PostController.deleteTweet);
router.get("/gettweeterPosts", PostController.getUserTweets);
router.post("/deleteLinkedInPost", PostController.deleteLinkedInPost);
router.get("/getlinkedinPosts", PostController.getLinkedInPosts);
router.get("/getUserDetailsTwitter/:userId",PostController.getUserDetailsTwitter);
router.get("/getUserDetailsLinkedin/:userId",PostController.getUserDetailsLinkedin);

module.exports = router;
