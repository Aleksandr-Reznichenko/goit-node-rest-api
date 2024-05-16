import "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import controllerWrapper from "../helpers/controllerWrapper.js";
import HttpError from "../helpers/HttpError.js";
import User from "../models/users.js";

export const register = controllerWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const emailInLowerCase = email.toLowerCase();

  const user = await User.findOne({ email: emailInLowerCase });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email: emailInLowerCase,
    password: passwordHash,
  });

  res.status(201).json({
    user: {
      email,
      subscription: newUser.subscription,
    },
  });
});

export const login = controllerWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const { JWT_SECRET } = process.env;
  const emailInLowerCase = email.toLowerCase();

  const user = await User.findOne({ email: emailInLowerCase });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw HttpError(401, "Email or password is wrong");
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: 60 * 60,
  });

  await User.findByIdAndUpdate(user._id, { token });
  res.status(200).json({
    token,
    user: {
      email,
      subscription: user.subscription,
    },
  });
});

export const getCurrent = controllerWrapper(async (req, res, next) => {
  const { email, subscription } = req.user;

  res.json({ email, subscription });
});

export const logout = controllerWrapper(async (req, res) => {
  const { id } = req.user;

  await User.findByIdAndUpdate(id, { token: "" });
  res.status(204).end();
});

export const updateSubscription = controllerWrapper(async (req, res, next) => {
  const { id } = req.user;
  const { subscription } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { subscription },
    { new: true }
  );

  if (!updatedUser) {
    throw HttpError(404);
  }

  res
    .status(200)
    .json({ email: updatedUser.email, subscription: updatedUser.subscription });
});
