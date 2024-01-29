import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// =================== Custom modules ======================
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";
import adminRouter from "./routers/adminRouter.js";
import appRouter from "./routers/appRouter.js";
import planRouter from "./routers/planRouter.js";
import taskRouter from "./routers/taskRouter.js";

const app = express();
dotenv.config({ path: "./config/.env" });

// ======================= Middlewares ======================
app.use(express.json());
app.use(cookieParser());

//Configure CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);

// ======================== Routing ========================
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/app", appRouter);
app.use("/api/v1/plan", planRouter);
app.use("/api/v1/task", taskRouter);
// =========================================================

// ======================== Main ========================
const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server started on port ${process.env.PORT}.`);
});

// Handling Unhandled Promise Rejection
process.on("unhandledRejection", err => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Unhandled promise rejection.");
  server.close(() => {
    process.exit(1);
  });
});
