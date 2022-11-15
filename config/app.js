const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  appName: process.env.APP_NAME,
  appUrl: process.env.APP_URL,
  appPort: process.env.PORT,
  dbUsername: process.env.DB_USERNAME,
  dbName: process.env.DB_NAME,
  dbPassword: process.env.DB_PASSWORD,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
  mailHost: process.env.MAIL_HOST,
  mailPort: process.env.MAIL_PORT,
  mailUser: process.env.MAIL_USER,
  mailPass: process.env.MAIL_PASSWORD,
  mailSecure: process.env.MAIL_SECURE,
};
