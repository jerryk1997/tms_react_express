// NOTE: this is a router for API related to the application table NOT app.js
import express from "express";
import {
  verifyUserSession,
  verifyUserAuthorised
} from "../controllers/authController.js";
import {
  createApplication,
  editApplication,
  fetchAllApplications,
  checkUserPerm
} from "../controllers/appController.js";
import { fetchAllGroups } from "../controllers/groupController.js";

// ===================== /api/v1/app ======================
const appRouter = express.Router();
appRouter.use("*", verifyUserSession);
appRouter.route("/").get(fetchAllApplications); // Project leads will get more info
appRouter.route("/:acronym/check/:perm").get(checkUserPerm);

appRouter.use(["*"], verifyUserAuthorised("project lead"));
appRouter.route("/").post(createApplication);
appRouter.route("/groups").get(fetchAllGroups);
appRouter.route("/:acronym").put(editApplication);

export default appRouter;
