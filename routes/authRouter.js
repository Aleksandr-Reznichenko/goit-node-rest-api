import express from "express";
import {
  register,
  login,
  logout,
  getCurrent,
  updateSubscription,
} from "../controllers/authControllers.js";
import validateBody from "../helpers/validateBody.js";
import auth from "../helpers/auth.js";
import {
  registerSchema,
  loginSchema,
  subscriptionSchema,
} from "../schemas/usersSchemas.js";

const router = express.Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/logout", auth, logout);
router.get("/current", auth, getCurrent);
router.patch("/", validateBody(subscriptionSchema), auth, updateSubscription);

export default router;
