// Custom modules
import db from "../db.js";
import {
  catchAsyncErrors,
  handleServerError
} from "../middlewares/errorHandler.js";
import { Checkgroup } from "./authController.js";

export const fetchAllApplications = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("\n\n========== Fetching all applications");
    // Check if user is project lead
    const [rows] = await db.execute(
      `
				SELECT \`groups\`
				FROM users
				WHERE username = ?
			`,
      [req.username]
    );
    const usersGroups = rows[0].groups;
    if (usersGroups) {
      var isProjectLead = usersGroups.includes("project lead");
    }
    console.log(`User is project lead: ${isProjectLead}`);

    const [applications] = await db.query(
      `
				SELECT ${
          isProjectLead
            ? "*" // Project lead can access permissions data
            : "App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate"
        } FROM application
			`
    );

    console.log(applications);

    return res.status(200).json({
      applications
    });
  } catch (error) {
    return handleServerError(error, res);
  }
});

export const createApplication = catchAsyncErrors(async (req, res, next) => {
  console.log("\n\n========== Creating application");
  const newApp = req.body;
  console.log("\nNew Application data\n", req.body);

  const queries = [];
  queries.push([
    `
				INSERT INTO application (
					App_Acronym,
					App_Rnumber,
					App_permit_Create,
					App_permit_Open,
					App_permit_toDoList,
					App_permit_Doing,
					App_permit_Done
				)
				VALUES (?, ?, ?, ?, ?, ?, ?)
			`,
    [
      newApp.acronym,
      newApp.rNum,
      newApp.createPerm,
      newApp.openPerm,
      newApp.todoPerm,
      newApp.doingPerm,
      newApp.donePerm
    ]
  ]);
  console.log("Added insert query");

  if (newApp.description) {
    queries.push([
      `UPDATE application SET App_Description = ? WHERE App_Acronym = ?`,
      [newApp.description, newApp.acronym]
    ]);
    console.log("Has description, added update query");
  }

  if (newApp.startDate) {
    queries.push([
      `UPDATE application SET App_startDate = ? WHERE App_Acronym = ?`,
      [newApp.startDate, newApp.acronym]
    ]);
  }

  if (newApp.endDate) {
    queries.push([
      `UPDATE application SET App_endDate = ? WHERE App_Acronym = ?`,
      [newApp.endDate, newApp.acronym]
    ]);
  }

  try {
    var connection = await db.getConnection();
    await connection.beginTransaction();
    console.log("Transaction began");
    for (const [query, values] of queries) {
      await connection.execute(query, values);
    }
    console.log("Transaction completed");
    await connection.commit();
    console.log("Transaction committed");

    connection.release();
    return res.status(200).json({
      message: "Successfully created application"
    });
  } catch (error) {
    console.log("Transaction failed");

    await connection.rollback();
    console.log("Transaction rolled back");

    connection.release();

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Application already exists"
      });
    }

    return handleServerError(error, res);
  }
});

export const editApplication = catchAsyncErrors(async (req, res, next) => {
  const acronym = decodeURIComponent(req.params.acronym);
  const editedFields = req.body;

  const queries = [];
  if (editedFields.description !== undefined) {
    queries.push([
      "UPDATE application SET App_Description = ? WHERE App_Acronym = ?",
      [
        editedFields.description === "" ? null : editedFields.description,
        acronym
      ]
    ]);
    console.log(
      `Description edited: <${editedFields.description}>, query added`
    );
  }

  if (editedFields.startDate) {
    queries.push([
      "UPDATE application SET App_startDate = ? WHERE App_Acronym = ?",
      [editedFields.startDate, acronym]
    ]);
    console.log(`Start date edited: <${editedFields.startDate}>, query added`);
  }

  if (editedFields.endDate) {
    queries.push([
      "UPDATE application SET App_endDate = ? WHERE App_Acronym = ?",
      [editedFields.endDate, acronym]
    ]);
    console.log(`End date edited <${editedFields.endDate}>, query added`);
  }

  if (editedFields.createPerm) {
    queries.push([
      "UPDATE application SET App_permit_Create = ? WHERE App_Acronym = ?",
      [editedFields.createPerm, acronym]
    ]);
    console.log(`End date edited <${editedFields.createPerm}>, query added`);
  }

  if (editedFields.openPerm) {
    queries.push([
      "UPDATE application SET App_permit_Open = ? WHERE App_Acronym = ?",
      [editedFields.openPerm, acronym]
    ]);
    console.log(`End date edited <${editedFields.openPerm}>, query added`);
  }

  if (editedFields.todoPerm) {
    queries.push([
      "UPDATE application SET App_permit_toDoList = ? WHERE App_Acronym = ?",
      [editedFields.todoPerm, acronym]
    ]);
    console.log(`End date edited <${editedFields.todoPerm}>, query added`);
  }

  if (editedFields.doingPerm) {
    queries.push([
      "UPDATE application SET App_permit_Doing = ? WHERE App_Acronym = ?",
      [editedFields.doingPerm, acronym]
    ]);
    console.log(`End date edited <${editedFields.doingPerm}>, query added`);
  }

  if (editedFields.donePerm) {
    queries.push([
      "UPDATE application SET App_permit_Done = ? WHERE App_Acronym = ?",
      [editedFields.donePerm, acronym]
    ]);
    console.log(`End date edited <${editedFields.donePerm}>, query added`);
  }

  try {
    var connection = await db.getConnection();
    await connection.beginTransaction();

    console.log("Transaction began");
    for (const [query, values] of queries) {
      await connection.execute(query, values);
    }
    console.log("Transaction completed");

    await connection.commit();
    console.log("Transaction committed");

    connection.release();
    return res.status(200).json({
      message: "Successfully edited application"
    });
  } catch (error) {
    console.log("Transaction failed");
    await connection.rollback();
    console.log("Transaction rolled back");

    connection.release();
    return handleServerError(error, res);
  }
});

export const checkUserPerm = catchAsyncErrors(async (req, res, next) => {
  const appAcronym = decodeURIComponent(req.params.acronym);
  const permToCheck = decodeURIComponent(req.params.perm);
  try {
    const [permRow] = await db.execute(
      `SELECT
        App_permit_Create,
        App_permit_Open,
        App_permit_toDoList,
        App_permit_Doing,
        App_permit_Done
      FROM application
      WHERE App_Acronym = ?
      `,
      [appAcronym]
    );
    const perms = permRow[0];

    let permit = false;
    switch (permToCheck) {
      case "create":
        permit = await Checkgroup(req.username, perms.App_permit_Create);
        break;
      case "open":
        permit = await Checkgroup(req.username, perms.App_permit_Open);
        break;
      case "todo":
        permit = await Checkgroup(req.username, perms.App_permit_toDoList);
        break;
      case "doing":
        permit = await Checkgroup(req.username, perms.App_permit_Doing);
        break;
      case "done":
        permit = await Checkgroup(req.username, perms.App_permit_Done);
        break;
      default:
        permit = false;
    }

    if (permit) {
      return res.status(200).json({
        message: "User is permitted"
      });
    } else {
      return res.status(401).json({
        message: "Unauthorised"
      });
    }
  } catch (error) {
    return handleServerError(error, res);
  }
});
