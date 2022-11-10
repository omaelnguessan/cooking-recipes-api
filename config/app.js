const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  appPort: process.env.PORT,
  dbUsername: process.env.DB_USERNAME,
  dbName: process.env.DB_NAME,
  dbPassword: process.env.DB_PASSWORD,
};
