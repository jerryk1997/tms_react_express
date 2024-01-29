import express from "express";

// =================== Custom modules ======================
import {
  verifyUserSession,
  verifyUserAuthorised
} from "../controllers/authController.js";
import {
  registerUser,
  fetchAllUsers,
  fetchUser,
  editUser
} from "../controllers/userController.js";
import { createGroup, fetchAllGroups } from "../controllers/groupController.js";

// ===================== /api/v1/admin ======================
const adminRouter = express.Router();

adminRouter.use(
  ["/user", "/group", "group/all", "/user/all", "/user/:username"],
  verifyUserSession,
  verifyUserAuthorised("admin")
);

adminRouter.route("/user").post(registerUser);
adminRouter.route("/group").post(createGroup);
adminRouter.route("/group/all").get(fetchAllGroups);
adminRouter.route("/user/all").get(fetchAllUsers);
adminRouter.route("/user/:username").get(fetchUser);
adminRouter.route("/user/:username").put(editUser);

export default adminRouter;
