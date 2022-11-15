const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");

const {
  jwtSecret,
  jwtRefreshTokenSecret,
  appName,
  appUrl,
} = require("../config/app");
const User = require("../models/User");
const { transporter } = require("../config/nodemailer");

exports.register = async (req, res, next) => {
  console.log(req.body);
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("validation failed, entered data is incorrect.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { name, email, password } = req.body;

    const hashedPass = await bcrypt.hash(password, 12);

    const user = new User({
      name: name,
      email: email,
      password: hashedPass,
      recipes: [],
    });

    await user.save();
    const userId = user._id.toString();

    await transporter.sendMail({
      to: email,
      from: `no-reply@${appName}.com`,
      subject: "Sign up succeeded and Account validation",
      html: `<h1>Hello ${name},</h1><p>Welcome to ${appName} Thank for your register</p><p>please click <a href="${appUrl}/auth/account-verify/${userId}">here</a> for your account validation.</p><br/><p>${appName}</p>`,
    });

    res.status(201).json({
      message: "User register successfully",
      userId: userId,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.accountVerify = async (req, res, next) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ _id: token, isActive: false });

    if (!user) {
      const error = new Error("Invalid token.");
      error.statusCode = 401;
      throw error;
    }

    user.isActive = true;
    await user.save();
    res.status(201).json({
      message: "User account validation successfully",
      userId: user._id.toString(),
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("validation failed, entered data is incorrect.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      const error = new Error("A user with this email could not be found.");
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Email or password is incorrect.");
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error(
        "Please verify your email to enable your account."
      );
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      jwtRefreshTokenSecret,
      { expiresIn: "1y" }
    );
    res.status(200).json({
      token: token,
      refreshToken: refreshToken,
      userId: user._id.toString(),
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.forgetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("validation failed, entered data is incorrect.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const { email } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("A user with this email could not be found.");
      error.statusCode = 401;
      throw error;
    }

    const token = uuidv4();
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 360000;

    await user.save();

    transporter.sendMail({
      to: email,
      from: `no-reply@${appName}.com`,
      subject: "Password Reset",
      html: `<p>You requested a password reset</p>
            <p>Click this <a href="${appUrl}/auth/update-password/${token}">link</a> to set a new password</p>`,
    });

    res.status(200).json({
      message: "You have received an email with the password recovery link",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.forgetPasswordToken = async (req, res, next) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      const error = new Error("Invalid token.");
      error.statusCode = 401;
      throw error;
    }
    res.json({
      message: "User found",
      token: user.resetToken,
      email: user.email,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { token, email, password } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("validation failed, entered data is incorrect.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const user = await User.findOne({
      email: email,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error("Invalid token.");
      error.statusCode = 401;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  const refreshToken = authHeader.split(" ")[1];

  let decodeRefreshToken;
  try {
    decodeRefreshToken = jwt.verify(refreshToken, jwtRefreshTokenSecret);

    if (!decodeRefreshToken) {
      const errors = new Error("Not authenticated.");
      errors.statusCode = 401;
      throw errors;
    }

    //find user exists

    const user = await User.findById(decodeRefreshToken.userId);

    if (!user) {
      const errors = new Error("Not authenticated.");
      errors.statusCode = 401;
      throw errors;
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    res
      .status(200)
      .json({ message: "Token refreshed succceffuly!", token: token });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
