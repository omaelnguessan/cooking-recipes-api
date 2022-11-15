const express = require("express");
const { body } = require("express-validator");
const User = require("../models/User");

const authController = require("../controllers/auth");

const router = express.Router();

router.post(
  "/register",
  body("name").trim().isLength({ min: 2 }),
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("E-mail address already exists!");
        }
      });
    })
    .normalizeEmail(),
  body("password").trim().isLength({ min: 8 }),
  authController.register
);

router.get("/account-verify/:token", authController.accountVerify);

router.post(
  "/login",
  body("email").isEmail().normalizeEmail(),
  body("password").trim().isLength({ min: 8 }),
  authController.login
);

router.post(
  "/forget-password",
  body("email").isEmail().normalizeEmail(),
  authController.forgetPassword
);

router.get("/update-password/:token", authController.forgetPasswordToken);

router.post(
  "/reset-password",
  body("email").isEmail().normalizeEmail(),
  body("token").isString(),
  body("password").trim().isLength({ min: 8 }),
  authController.resetPassword
);

router.get("/refresh-token", authController.refreshToken);

module.exports = router;
