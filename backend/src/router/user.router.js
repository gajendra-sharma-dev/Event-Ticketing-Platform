import { Router } from "express";
import {
  registerUser,
  getUser,
  loginUser,
  logout,
  refreshAccessToken,
  UpdateUserDetail,
  updatePassword,
} from "../controllers/user.controllers.js";
import { VerifyJWT } from "../middleware/Auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/getUser").get(getUser);
router.route("/login").post(loginUser);
router.route("/logout").post(VerifyJWT, logout);
router.route("/refreshToken").patch(refreshAccessToken);
router.route("/update").patch(VerifyJWT, UpdateUserDetail);
router.route("/updatepassword").patch(VerifyJWT, updatePassword);

export default router;
