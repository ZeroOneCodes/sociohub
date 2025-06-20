const express = require("express");
const passport = require("passport");
const router = express.Router();
const AuthController = require("./controller");

router.post("/auth/signup", AuthController.signup);
router.post("/auth/login", AuthController.login);
router.post("/auth/refresh-token", AuthController.refreshToken);
router.post("/auth/logout", AuthController.logout);
router.get("/auth/twitter", passport.authenticate("twitter"));
router.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", {
    failureRedirect: "http://localhost:5173/login",
  }),
  AuthController.twitterCallback
);
router.get("/auth/linkedin", passport.authenticate("linkedin"));
router.get(
  "/auth/linkedin/callback",
  passport.authenticate("linkedin", {
    failureRedirect: "http://localhost:5173/login",
  }),
  AuthController.linkedInCallback
);

module.exports = router;