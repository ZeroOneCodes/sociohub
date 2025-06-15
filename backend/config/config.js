require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    dialectOptions: {
      // ssl: {
      //   require: true,
      //   rejectUnauthorized: false, // Set to `true` if you have a CA certificate
      // },
    },
    logging: false, // Disable SQL query logging
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    dialectOptions: {
      // ssl: {
      //   require: true,
      //   rejectUnauthorized: false, // Change this if using a verified CA certificate
      // },
    },
    logging: false,
  },
};
