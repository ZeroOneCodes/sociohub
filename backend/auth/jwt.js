const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "DUMMYSECRETTESTINGSOCIOHUB";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "DUMMYSECRETTESTINGSOCIOHUBTEST";
const SILENT_TOKEN_SECRET = process.env.SILENT_TOKEN_SECRET || "DUMMYSILENTTOKENSECRET";

module.exports.generateSilentToken = (user) => {
  return jwt.sign(
    { userId: user.user_id }, 
    SILENT_TOKEN_SECRET,
    { expiresIn: "30d" }
  );
};

module.exports.generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.user_id, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

module.exports.generateRefreshToken = (user) => {
  return jwt.sign({ userId: user.user_id }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};
