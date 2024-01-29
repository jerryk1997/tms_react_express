import express from "express";

// =================== Custom modules ======================
import { verifyUserSession } from "../controllers/authController.js";
import { fetchCurrentUser, editUser } from "../controllers/userController.js";

// ===================== /api/v1/user ======================
const userRouter = express.Router();

userRouter.use(["/profile"], verifyUserSession);

userRouter.route("/profile").put(editUser);
userRouter.route("/profile").get(fetchCurrentUser);

export default userRouter;
