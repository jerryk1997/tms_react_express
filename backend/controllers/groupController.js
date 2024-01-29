// Custom modules
import db from "../db.js";
import {
  catchAsyncErrors,
  handleServerError
} from "../middlewares/errorHandler.js";

export const createGroup = catchAsyncErrors(async (req, res, next) => {
  const { groupName } = req.body;
  console.log(`========== Creating group: <${groupName}>`);

  try {
    await db.execute(
      `
        INSERT INTO \`groups\` (group_name) 
        VALUES (?)
      `,
      [groupName]
    );

    console.log("Successfully created group");
    return res.status(200).json({
      message: "Successfully created group."
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      console.log(`Group: <${groupName}> exists, no need to create.`);
      return res.status(204).end();
    } else {
      console.error("Failed to create group");
      return handleServerError(error, res);
    }
  }
});

export const fetchAllGroups = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("\n\n========== Fetching all groups");
    const [rows] = await db.query(`
      SELECT * FROM \`groups\`
    `);

    const groupNames = rows.map(row => row.group_name);
    console.log(`Fetched all groups <${groupNames}>`);
    return res.status(200).json({
      groups: groupNames
    });
  } catch (error) {
    return handleServerError(error, res);
  }
});
