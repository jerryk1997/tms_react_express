import express from "express";
import {
  verifyUserSession,
  verifyUserAuthorised
} from "../controllers/authController.js";

import {
  fetchAllPlans,
  createPlan,
  editPlan
} from "../controllers/planController.js";

// ===================== /api/v1/plan ======================
// acronym: App_Acronym that is associated with the plan
const planRouter = express.Router();
planRouter.use("*", verifyUserSession);

planRouter.route("/:acronym").get(fetchAllPlans);

planRouter.use("*", verifyUserAuthorised("project manager"));
planRouter.route("/:acronym").post(createPlan);
planRouter.route("/:acronym/:mvpName").put(editPlan);

export default planRouter;
