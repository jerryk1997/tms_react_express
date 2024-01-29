import express from "express";
import { verifyUserSession } from "../controllers/authController.js";
import {
  createTask,
  fetchAllTasks,
  editTask
} from "../controllers/taskController.js";

// ===================== /api/v1/task ======================
const taskRouter = express.Router();
taskRouter.use("*", verifyUserSession);

taskRouter.route("/:acronym").get(fetchAllTasks);

taskRouter.route("/:acronym").post(createTask);
taskRouter.route("/:acronym/:taskID").put(editTask);

export default taskRouter;
