import { Router } from "express";
import { verifyuser } from "../middlewares/auth.middleware.js";
import { getProfile, updateProfile } from "../controllers/profile.controller.js";

const router=Router();
router.get("/getprofile",verifyuser,getProfile);
router.post("/updateprofile",verifyuser,updateProfile);
export default router;