require("dotenv").config();
const sequelize = require("./dbconfig");

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection has been established successfully.");
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
  }
};

module.exports = startServer;
