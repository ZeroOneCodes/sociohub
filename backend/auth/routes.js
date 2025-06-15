const express = require("express");
const router = express.Router();
const AuthController = require("./controller")

router.post("/auth/signup", AuthController.signup);
router.post("/auth/login", AuthController.login);
router.post("/auth/refresh-token", AuthController.refreshToken);

module.exports = router;