import { Router } from "express";
import { login, logout, me, refresh, signup } from "../controllers/user.controller.js";
import { verifyuser } from "../middlewares/auth.middleware.js";

const router=Router();
router.post("/signup",signup);
router.post("/login",login);
router.post("/logout",verifyuser,logout);
router.post("/refresh",refresh);
router.get("/me",verifyuser,me);
export default router;
