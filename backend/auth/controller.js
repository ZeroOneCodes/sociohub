require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../models/Users");
const { generateAccessToken, generateRefreshToken } = require("./jwt");
const TwitterProfile = require('../models/TwitterProfile.js');
const LinkedInProfile = require('../models/LinkedProfile.js');

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "";

module.exports.signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Users.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      user: {
        id: user.user_id,
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user.user_id,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await Users.findOne({ where: { user_id: decoded.userId } });
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh token error:", err);
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};

module.exports.logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Logout successful"
    });
  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.twitterCallback = (req, res) => {
  res.redirect(`${FRONTEND_BASE_URL}/connect/apps`);
};

module.exports.linkedInCallback = (req, res) => {
  res.redirect(`${FRONTEND_BASE_URL}/connect/apps`);
};

module.exports.checkTwitterStatus = async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    // Find the Twitter profile for this user
    const twitterProfile = await TwitterProfile.findOne({ 
      where: { user_id: userId } 
    });

    if (!twitterProfile) {
      return res.json({ 
        connected: false,
        message: 'No Twitter profile found for this user'
      });
    }

    // Check if tokens exist
    const hasTokens = twitterProfile.twitter_token && twitterProfile.twitter_secret;

    res.json({
      status:true,
      profile: {
        name: twitterProfile.name,
        screen_name: twitterProfile.screen_name,
        // Include other profile info if needed
      },
      tokens: {
        hasToken: !!twitterProfile.twitter_token,
        hasSecret: !!twitterProfile.twitter_secret
      }
    });

  } catch (error) {
    console.error('Error checking Twitter status:', error);
    res.status(500).json({ 
      error: 'Failed to check Twitter connection status',
      details: error.message 
    });
  }
};

module.exports.checkLinkedInStatus = async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    const linkedInProfile = await LinkedInProfile.findOne({ 
      where: { user_id: userId } 
    });

    if (!linkedInProfile) {
      return res.json({ 
        connected: false,
        message: 'No LinkedIn profile found for this user'
      });
    }

    res.json({
      status: true,
      profile: {
        name: linkedInProfile.name,
        email: linkedInProfile.email,
        picture: linkedInProfile.picture
      },
      tokens: {
        hasAccessToken: !!linkedInProfile.access_token,
        hasRefreshToken: !!linkedInProfile.refresh_token
      }
    });

  } catch (error) {
    console.error('Error checking LinkedIn status:', error);
    res.status(500).json({ 
      error: 'Failed to check LinkedIn connection status',
      details: error.message 
    });
  }
};


