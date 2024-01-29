// Node modules
import bCrypt from "bcryptjs";

// Custom modules
import db from "../db.js";
import {
  catchAsyncErrors,
  handleServerError
} from "../middlewares/errorHandler.js";

export const fetchAllPlans = catchAsyncErrors(async (req, res, next) => {
  console.log("\n\n========== Fetching all applications");
  const appAcronym = decodeURIComponent(req.params.acronym);
  console.log(`Fetching for <${appAcronym}>`);

  try {
    const [rows] = await db.execute(
      `SELECT * FROM plan WHERE Plan_app_Acronym = ?`,
      [appAcronym]
    );
    console.log("Fetched");

    return res.status(200).json({
      plans: rows.map(planRow => {
        return {
          mvpName: planRow.Plan_MVP_name,
          startDate: planRow.Plan_startDate,
          endDate: planRow.Plan_endDate
        };
      })
    });
  } catch (error) {
    return handleServerError(error, res);
  }
});

export const createPlan = catchAsyncErrors(async (req, res, next) => {
  console.log("\n\n========== Creating Plan");
  const appAcronym = decodeURIComponent(req.params.acronym);
  const { mvpName, startDate, endDate } = req.body;
  console.log(req.body);

  const queries = [];
  // Add mandatory fields
  queries.push([
    `
			INSERT INTO plan (Plan_MVP_name, Plan_app_Acronym)
			VALUES (?, ?)
		`,
    [mvpName, appAcronym]
  ]);
  console.log("Mandatory fields query added");

  // Add optional fields
  if (startDate) {
    queries.push([
      `UPDATE plan SET Plan_startDate = ? WHERE Plan_MVP_name = ? and Plan_app_Acronym = ?`,
      [startDate, mvpName, appAcronym]
    ]);
    console.log(startDate, appAcronym);
  }

  if (endDate) {
    queries.push([
      `UPDATE plan SET Plan_endDate = ? WHERE Plan_MVP_name = ? and Plan_app_Acronym = ?`,
      [endDate, mvpName, appAcronym]
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
      message: `Successfully created plan for ${appAcronym}`
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      console.log("Plan already exists");
      connection.release();
      return res.status(409).json({
        message: "Plan name exists for application"
      });
    }
    connection.release();
    return handleServerError(error, res);
  }
});

export const editPlan = catchAsyncErrors(async (req, res, next) => {
  console.log("\n\n========== Editing plan");
  const appAcronym = decodeURIComponent(req.params.acronym);
  const mvpName = decodeURIComponent(req.params.mvpName);
  const editedFields = req.body;
  console.log(`Editing plan: <${mvpName}> for app: <${appAcronym}>`);
  console.log(req.body);

  const queries = [];
  if (editedFields.startDate) {
    queries.push([
      `
				UPDATE plan 
				SET Plan_startDate = ? 
				WHERE Plan_MVP_name = ? and Plan_app_Acronym = ?
			`,
      [editedFields.startDate, mvpName, appAcronym]
    ]);
    console.log(
      `startDate changed to <${editedFields.startDate}>, query added`
    );
  }

  if (editedFields.endDate) {
    queries.push([
      `
				UPDATE plan 
				SET Plan_endDate = ? 
				WHERE Plan_MVP_name = ? and Plan_app_Acronym = ?
			`,
      [editedFields.endDate, mvpName, appAcronym]
    ]);
    console.log(`endDate changed to <${editedFields.endDate}>, query added`);
  }

  try {
    var connection = await db.getConnection();

    connection.beginTransaction();
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
