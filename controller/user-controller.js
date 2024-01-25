const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");


const signup = async (req, res, next) => {
  const error = validationResult(req);
  console.log(error," << >> ",req.body)
  if (!error.isEmpty()) {
    return next(new HttpError("Please check your Inputs", 422));
  }
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Signup failed, try again later", 500));
  }

  if (existingUser) {
    return next(new HttpError("User Already Exists", 422));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Unable to create User try again later", 500);
    return next(error);
  }

  const newUser = new User({
    name,
    email: email,
    password: hashedPassword,
    tasks: [],
  });

  try {
    await newUser.save();
  } catch (err) {
    return next(new HttpError("Failed to Create New User", 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      'today_is_best_day_of_my_life',
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }
  res
    .status(201)
    .json({ name: newUser.name, userId: newUser.id, email: newUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Logged In failed, try again later", 500));
  }

  if (!existingUser) {
    return next(new HttpError("Invalid Credentials", 401));
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check credentials and try again.",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Could not log you in, please check credentials and try again.",
      401
    );
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      'today_is_best_day_of_my_life',
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging In failed, please try again later.",
      500
    );
    return next(error);
  }

  res.json({
    name: existingUser.name,
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

exports.signup = signup;
exports.login = login;
