const express = require("express");
const { check } = require("express-validator");
const userController = require("../controller/user-controller");

const router = express.Router();

router.post(
  "/signup",
  [
    check("name").notEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  userController.signup
);
router.post("/login", userController.login);

module.exports = router;
