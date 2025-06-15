require("dotenv").config();
const Sequelize = require("sequelize");

const env = process.env.NODE_ENV;

const dbConfig = env === "test"
  ? {
      database: process.env.TEST_DB_DATABASE,
      username: process.env.TEST_DB_USERNAME,
      password: process.env.TEST_DB_PASSWORD,
      host: process.env.TEST_DB_HOST,
      port: process.env.TEST_DB_PORT,
      dialectOptions: {},
    }
  : {
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialectOptions: {
        // Uncomment and configure this if you're using SSL
        // ssl: {
        //   require: true,
        //   rejectUnauthorized: false,
        // },
      },
    };

// Create the Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: "postgres",
    dialectOptions: dbConfig.dialectOptions,
    define: {
      timestamps: false,
    },
    logging: false, // Set to true if you want SQL logs
  }
);

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Connection to the PostgreSQL database established successfully.");
  })
  .catch((err) => {
    console.error("❌ Unable to connect to the PostgreSQL database:", err);
  });

module.exports = sequelize;
