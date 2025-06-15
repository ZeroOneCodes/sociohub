require("dotenv").config();
const WorkingRoute = require("./working/routes");
const AuthRoute = require("./auth/routes");
const startServer = require("./checkDb");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_BASE_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

startServer();
app.use("/api/v1", AuthRoute);
app.use("/api/v1", WorkingRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server connected at http://localhost:${process.env.PORT}`);
});
