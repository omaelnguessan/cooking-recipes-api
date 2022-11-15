const nodemailer = require("nodemailer");
const { mailHost, mailPass, mailPort, mailUser, mailSecure } = require("./app");

const nodemailerOptions = {
  host: mailHost,
  port: mailPort,
  secure: false,
  auth: {
    user: mailUser,
    pass: mailPass,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
};

exports.transporter = nodemailer.createTransport(nodemailerOptions);
