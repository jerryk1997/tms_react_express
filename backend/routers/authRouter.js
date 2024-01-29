import express from "express";

// =================== Custom modules ======================
import {
  verifyUserSession,
  loginUser,
  logoutUser,
  verifyUserAuthorised
} from "../controllers/authController.js";

// ===================== /api/v1/auth ======================
const authRouter = express.Router();
authRouter.use(["/verify/*", "/verify-session"], verifyUserSession);

authRouter.route("/login").post(loginUser);
authRouter.route("/logout").get(logoutUser);
authRouter.route("/verify-session").get((req, res) => {
  res.status(200).json({
    message: "Session verified"
  });
});
authRouter.route("/verify/:group").get(
  (req, res, next) => {
    verifyUserAuthorised(req.params.group)(req, res, next);
  },
  (req, res) => {
    res.status(200).json({
      message: "Authorised"
    });
  }
);

export default authRouter;
