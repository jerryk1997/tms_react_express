// Node modules
import dayjs from "dayjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Custom modules
import db from "../db.js";
import {
  catchAsyncErrors,
  handleServerError
} from "../middlewares/errorHandler.js";
import { Checkgroup } from "./authController.js";

dotenv.config({ path: "../config/.env" });

var transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  },
  debug: false,
  logger: true
});

async function generateAuditTrailEntry(action, connection) {
  const entryDetails = action.value;
  let details;
  switch (action.type) {
    case "create":
      details = "Action: Created";
      break;
    case "add notes":
      details =
        "Action: Added Notes\n" +
        "\n" +
        "Notes added:\n" +
        "---------------------\n" +
        `${entryDetails.notes}\n` +
        "---------------------";
      break;
    case "change plan":
      details =
        "Action: Changed plan\n" +
        `Previous plan: ${entryDetails.prevPlan}\n` +
        `Current plan: ${entryDetails.currPlan}`;
      break;
    case "promote":
      details =
        "Action: Promoted\n" +
        `Previous state: ${entryDetails.prevState}\n` +
        `Current state: ${entryDetails.currState}`;
      break;
    case "demote":
      details =
        "Action: Demoted\n" +
        `Previous state: ${entryDetails.prevState}\n` +
        `Current state: ${entryDetails.currState}`;
      break;
  }

  const [rows] = await connection.execute(
    `SELECT Task_notes, Task_plan, Task_state FROM task WHERE Task_id = ?`,
    [action.value.taskID]
  );
  const taskData = rows[0];

  const entry =
    "=====================\n" +
    "\n" +
    `DateTimeStamp: ${entryDetails.datetimeStamp}\n` +
    `Owner: ${entryDetails.username}\n` +
    `Task State: ${taskData.Task_state}\n` +
    `Task plan: ${
      taskData.Task_plan === null ? "Not assigned" : taskData.Task_plan
    }\n` +
    "\n" +
    `${details}\n` +
    "\n" +
    "=====================";

  let auditTrail = taskData.Task_notes;
  if (auditTrail === null) {
    auditTrail = entry;
  } else {
    auditTrail = entry + "\n\n" + auditTrail;
  }

  try {
    await connection.execute(
      `UPDATE task SET Task_notes = ? WHERE Task_id = ?`,
      [auditTrail, entryDetails.taskID]
    );
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export const createTask = catchAsyncErrors(async (req, res, next) => {
  console.log("\n\n========== Creating task");
  const appAcronym = decodeURIComponent(req.params.acronym);
  const taskData = req.body;
  const now = dayjs();

  // VERIFYING PERMISSIONS
  console.log();
  const [createPermRows] = await db.execute(
    `SELECT App_permit_Create FROM application WHERE App_Acronym = ?`,
    [appAcronym]
  );
  console.log(appAcronym);
  console.log(
    await db.execute(
      `SELECT App_permit_Create FROM application WHERE App_Acronym = ?`,
      [appAcronym]
    )
  );
  const createPerm = createPermRows[0].App_permit_Create;
  console.log(`Only <${createPerm}> can create task for <${appAcronym}>`);

  if (!(await Checkgroup(req.username, createPerm))) {
    return res.status(401).json({
      message: "Unauthorised"
    });
  }

  // GENERATING RELEVANT VALUES
  // Task_id
  const [rNumRows] = await db.execute(
    `SELECT App_Rnumber FROM application WHERE App_Acronym = ?`,
    [appAcronym]
  );
  const rNum = rNumRows[0].App_Rnumber;
  const id = appAcronym + "_" + rNum;

  // Task_createDate
  const createDate = now.format("YYYY-MM-DD");

  // Task_state
  const state = "open";

  // Task_creator / Task_owner
  const creator = req.username;
  const owner = req.username;

  // ADDING QUERIES
  const queries = [];
  queries.push([
    `
			INSERT INTO task (
				Task_Name, 
				Task_id, 
				Task_createDate, 
				Task_state, 
				Task_creator, 
				Task_owner, 
				Task_app_Acronym
			) VALUES (?, ?, ?, ?, ?, ?, ?)
		`,
    [taskData.name, id, createDate, state, creator, owner, appAcronym]
  ]);

  // Add optional values
  if (taskData.description) {
    queries.push([
      `UPDATE task SET Task_description = ? WHERE Task_id = ?`,
      [taskData.description, id]
    ]);
  }

  if (taskData.plan) {
    queries.push([
      `UPDATE task SET Task_plan = ? WHERE Task_id = ?`,
      [taskData.plan, id]
    ]);
  }

  try {
    // Insert all data
    var connection = await db.getConnection();

    await connection.beginTransaction();
    console.log("Transaction began");

    for (const [query, values] of queries) {
      await connection.execute(query, values);
    }
    console.log("Created task");

    // Generate audit trail
    const auditData = {
      datetimeStamp: now.format("DD/MM/YYYY hh:mmA"),
      username: req.username,
      taskID: id
    };

    const success = await generateAuditTrailEntry(
      {
        type: "create",
        value: auditData
      },
      connection
    );
    if (!success) {
      throw new Error("Failed to add audit trail");
    }
    console.log("Updated audit trail");

    // Increment R num
    const [rNumRow] = await connection.execute(
      "SELECT App_Rnumber FROM application WHERE App_Acronym = ?",
      [appAcronym]
    );
    const rNum = rNumRow[0].App_Rnumber;
    await connection.execute(
      "UPDATE application SET App_Rnumber = ? WHERE App_Acronym = ?",
      [rNum + 1, appAcronym]
    );
    console.log("App rNum incremented");

    // Clean up
    console.log("Transaction completed");
    await connection.commit();
    console.log("Transaction committed");

    connection.release();
    return res.status(200).json({
      message: "Task created successfully"
    });
  } catch (error) {
    console.log("Transaction failed");
    await connection.rollback();
    console.log("Transaction rolled back");

    connection.release();
    return handleServerError(error, res);
  }
});

export const fetchAllTasks = catchAsyncErrors(async (req, res, next) => {
  console.log("\n\n========== Fetching all tasks");
  const appAcronym = decodeURIComponent(req.params.acronym);

  try {
    const [tasks] = await db.execute(
      "SELECT * FROM task WHERE Task_app_Acronym = ?",
      [appAcronym]
    );
    console.log("Tasks fetched");

    return res.status(200).json({
      tasks: tasks.map(task => {
        return {
          name: task.Task_Name,
          description: task.Task_description,
          notes: task.Task_notes,
          id: task.Task_id,
          plan: task.Task_plan,
          createDate: task.Task_createDate,
          state: task.Task_state,
          creator: task.Task_creator,
          owner: task.Task_owner,
          acronym: task.Task_app_Acronym
        };
      })
    });
  } catch (error) {
    return handleServerError(error, res);
  }
});

export const fetchTask = catchAsyncErrors(async (req, res, next) => {
  console.log("\n\n========== Fetch task");
  const taskID = decodeURIComponent(req.params.taskID);
  console.log(`Task to fetch: <${taskID}>`);

  try {
    const [taskRow] = await db.execute("SELECT * FROM task WHERE Task_id = ?", [
      taskID
    ]);
    const task = taskRow[0];
    console.log("Task fetched", task);

    return res.status(200).json({
      task: {
        name: task.Task_Name,
        description: task.Task_description,
        notes: task.Task_notes,
        id: task.Task_id,
        plan: task.Task_plan,
        createDate: task.Task_createDate,
        state: task.Task_state,
        creator: task.Task_creator,
        owner: task.Task_owner,
        acronym: task.Task_app_Acronym
      }
    });
  } catch (error) {
    return handleServerError(error, res);
  }
});

export const editTask = catchAsyncErrors(async (req, res, next) => {
  console.log("\n\n========== Editing Task");
  const appAcronym = decodeURIComponent(req.params.acronym);
  const taskID = decodeURIComponent(req.params.taskID);
  const now = dayjs();
  console.log(`Editing <${taskID}> for <${appAcronym}>`);

  // Basic information needed for audit trail
  const auditData = {
    datetimeStamp: now.format("DD/MM/YYYY hh:mmA"),
    username: req.username,
    taskID: taskID
  };

  const [taskRow] = await db.execute("SELECT * FROM task WHERE Task_id = ?", [
    taskID
  ]);
  const task = taskRow[0];
  console.log(task);

  // =========== VERIFY USER CAN EDIT ===========
  let permColumn;
  switch (task.Task_state) {
    case "open":
      permColumn = "App_permit_Open";
      break;
    case "todo":
      permColumn = "App_permit_toDoList";
      break;
    case "doing":
      permColumn = "App_permit_Doing";
      break;
    case "done":
      permColumn = "App_permit_Done";
      break;
  }

  const [permGroupRow] = await db.execute(
    `SELECT ${permColumn} FROM application WHERE App_Acronym = ?`,
    [appAcronym]
  );
  const permGroup = permGroupRow[0][permColumn];
  console.log(`Task is <${task.Task_state}> only <${permGroup}> can edit`);

  if (!(await Checkgroup(req.username, permGroup))) {
    return res.status(401).json({
      message: "Unauthorised"
    });
  }
  console.log("User authorised");

  // =========== UPDATING TASK ===========
  const updatedTaskData = req.body;

  try {
    var connection = await db.getConnection();

    await connection.beginTransaction();

    // =========== CHANGE PLAN ===========
    if (
      (task.Task_state === "open" || task.Task_state === "done") &&
      updatedTaskData.plan !== undefined
    ) {
      await connection.execute(
        "UPDATE task SET Task_plan = ? WHERE Task_id = ?",
        [updatedTaskData.plan === "" ? null : updatedTaskData.plan, taskID]
      );
      await generateAuditTrailEntry(
        {
          type: "change plan",
          value: {
            ...auditData,
            prevPlan: task.Task_plan ? task.Task_plan : "Not assigned",
            currPlan: updatedTaskData.plan
              ? updatedTaskData.plan
              : "Not assigned"
          }
        },
        connection
      );
      console.log(`Plan changed to <${updatedTaskData.plan}>`);
    }

    // =========== ADD NOTES ===========
    if (updatedTaskData.notes) {
      await generateAuditTrailEntry(
        {
          type: "add notes",
          value: {
            ...auditData,
            notes: updatedTaskData.notes
          }
        },
        connection
      );
      console.log(`Notes added <${updatedTaskData.notes}>`);
    }

    // =========== PROMOTE / DEMOTE ===========
    if (updatedTaskData.promote) {
      // promote
      let nextState;
      switch (task.Task_state) {
        case "open":
          nextState = "todo";
          break;
        case "todo":
          nextState = "doing";
          break;
        case "doing":
          nextState = "done";
          break;
        case "done":
          nextState = "closed";
          break;
      }

      await connection.execute(
        "UPDATE task SET Task_state = ? WHERE Task_id = ?",
        [nextState, taskID]
      );
      await generateAuditTrailEntry(
        {
          type: "promote",
          value: {
            ...auditData,
            prevState: task.Task_state,
            currState: nextState
          }
        },
        connection
      );

      // Send email to pl if task is changed to done
      if (task.Task_state === "doing") {
        console.log("Sending emails");
        const [permitDoneRow] = await connection.query(
          `
        		SELECT App_permit_Done
        		FROM application
        		WHERE App_Acronym = ?
        	`,
          [appAcronym]
        );
        const permitDone = permitDoneRow[0].App_permit_Done;

        const [emailRows] = await connection.query(
          `
						SELECT email FROM users
						WHERE email IS NOT NULL 
						AND (\`groups\` = '${permitDone}' 
								OR \`groups\` LIKE '${permitDone}/%' 
								OR \`groups\` LIKE '%/${permitDone}' 
								OR \`groups\` LIKE '%/${permitDone}/%')
				`
        );
        const emails = emailRows.map(emailRow => emailRow.email);

        if (emailRows.length > 0) {
          const mailOptions = {
            from: "noreply@tms.com",
            to: emails.join(", "),
            subject: `Task completion for ${task.Task_app_Acronym}`,
            text:
              `ID: ${task.Task_id}\n` +
              `Name: ${task.Task_Name}\n` +
              `Completed by: ${req.username}`
          };
          console.log(mailOptions);

          transport.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error occurred: ", error);
            } else {
              console.log("Email sent: ", info.response);
            }
          });
        }
      }

      console.log(`Task promoted to <${nextState}>`);
    } else if (
      updatedTaskData.demote &&
      (task.Task_state === "doing" || task.Task_state === "done")
    ) {
      // demote
      let nextState;
      if (task.Task_state === "doing") {
        nextState = "todo";
      } else {
        nextState = "doing";
      }

      await connection.execute(
        "UPDATE task SET Task_state = ? WHERE Task_id = ?",
        [nextState, taskID]
      );
      await generateAuditTrailEntry(
        {
          type: "demote",
          value: {
            ...auditData,
            prevState: task.Task_state,
            currState: nextState
          }
        },
        connection
      );
    } else if (updatedTaskData.demote) {
      return res.status(422).json({
        message: "Task cannot be demoted"
      });
    }

    // =========== REASSIGN OWNER ===========
    await connection.execute(
      "UPDATE task SET Task_owner = ? WHERE Task_id = ?",
      [req.username, taskID]
    );
    console.log(`Owner reassigned to <${req.username}>`);

    // =========== COMPLETED ===========
    console.log("Transation completed");
    await connection.commit();
    console.log("Transaction committed");

    connection.release();
    return res.status(200).json({
      message: "Task successfully edited"
    });
  } catch (error) {
    console.log("Transaction failed");
    await connection.rollback();
    console.log("Transaction rolled back");

    connection.release();
    return handleServerError(error, res);
  }
});
