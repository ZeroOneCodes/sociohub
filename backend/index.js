require("dotenv").config();
const WorkingRoute = require("./working/routes");
const AuthRoute = require("./auth/routes");
const PostRoute = require("./posts/routes");
const startServer = require("./checkDb");
const express = require("express");
const passport = require("passport");
const { startWorker } = require('./queues/worker');
const cors = require("cors");
const session = require('express-session');
const cookieParser = require("cookie-parser");
require("./auth/passport");
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_BASE_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'your_secret_key_here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
}));
app.use(passport.initialize())
app.use(passport.session())

startServer();
startWorker()
app.use("/api/v1", AuthRoute);
app.use("/api/v1", WorkingRoute);
app.use("/api/v1", PostRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server connected at http://localhost:${process.env.PORT}`);
});
