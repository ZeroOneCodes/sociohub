require("dotenv").config();
const express = require("express");
const passport = require("passport");
const router = express.Router();
const AuthController = require("./controller");

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL;

router.post("/auth/signup", AuthController.signup);
router.post("/auth/login", AuthController.login);
router.post("/auth/refresh-token", AuthController.refreshToken);
router.post("/auth/logout", AuthController.logout);
router.get("/auth/twitter", passport.authenticate("twitter"));
router.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", {
    failureRedirect: `${FRONTEND_BASE_URL}/login`,
  }),
  AuthController.twitterCallback
);
router.get("/auth/linkedin", passport.authenticate("linkedin"));
router.get(
  "/auth/linkedin/callback",
  passport.authenticate("linkedin", {
    failureRedirect: `${FRONTEND_BASE_URL}/login`,
  }),
  AuthController.linkedInCallback
);
router.get("/auth/twitter/status", AuthController.checkTwitterStatus);
router.get("/auth/linkedin/status", AuthController.checkLinkedInStatus);

module.exports = router;
