// Node modules
import bCrypt from "bcryptjs";

// Custom modules
import db from "../db.js";
import {
  catchAsyncErrors,
  handleServerError
} from "../middlewares/errorHandler.js";

export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { username, password, email, groups, isActive } = req.body;

  console.log("\n\n========== Registering User");
  // Check if user exists
  try {
    console.log("Check if user exists:", username);
    const [rows] = await db.execute(
      `
      SELECT
        username
      FROM users
      WHERE username = ?
    `,
      [username]
    );

    if (rows[0]) {
      console.log("User exists");
      return res.status(409).json({
        error: "Username is taken."
      });
    }
  } catch (error) {
    return handleServerError(error, res);
  }
  const passwordHash = await bCrypt.hash(password, 10);

  const queries = [];
  // Insert user with mandatory input
  queries.push([
    `
      INSERT INTO users (username, password, is_active)
      VALUES (?, ?, ?)
    `,
    [username, passwordHash, isActive === "active" ? true : false]
  ]);

  console.log("Added query: Insert username, passwordHash and isActive");

  // Insert optional inputs if exist
  if (email) {
    queries.push([
      `UPDATE users SET email = ? WHERE username = ?`,
      [email, username]
    ]);

    console.log(`Added query: Update user email <${email}>`);
  }

  if (groups) {
    let groupsStr;
    if (Array.isArray(groups)) {
      groupsStr = groups.join("/");
    } else {
      groupsStr = groups;
    }
    queries.push([
      `UPDATE users SET \`groups\` = ? WHERE username = ?`,
      [groupsStr, username]
    ]);
    console.log(`Added query: Update user groups <${groupsStr}>`);
  }

  // Insert into database
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
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    await connection.rollback();
    connection.release();
    return handleServerError(error, res);
  }
});

export const fetchAllUsers = catchAsyncErrors(async (req, res, next) => {
  console.log("\n\n========== Fetching all users");
  try {
    const [rows] = await db.query(
      `
      SELECT
        username,
        email,
        \`groups\`,
        is_active
      FROM users
    `
    );

    console.log("Fetched all users");
    return res.status(200).json({
      users: rows
    });
  } catch (error) {
    return handleServerError(error, res);
  }
});

export const fetchCurrentUser = catchAsyncErrors(async (req, res, next) => {
  const username = req.username;
  console.log(`========== Fetching current user: <${username}>`);
  try {
    const user = (
      await db.execute(
        `
      SELECT
        username,
        email
      FROM users
      WHERE username = ?
    `,
        [username]
      )
    )[0];

    if (user) {
      console.log("User fetched");
      return res.status(200).json({
        user
      });
    } else {
      console.log("User not found");
      return res.status(404).json({
        error: "User not found"
      });
    }
  } catch (error) {
    return handleServerError(error, res);
  }
});

export const fetchUser = catchAsyncErrors(async (req, res, next) => {
  const username = decodeURIComponent(req.params.username);
  console.log(`========== Fetching user with username: <${username}>`);
  try {
    const users = (
      await db.execute(
        `
      SELECT
        username,
        email,
        \`groups\`,
        is_active
      FROM users
      WHERE username = ?
    `,
        [username]
      )
    )[0];

    if (users.length === 1) {
      return res.status(200).json({
        user: users[0]
      });
    } else if (users.length === 0) {
      return res.status(404).json({
        error: "User not found"
      });
    } else {
      throw new Error("Internal server error");
    }
  } catch (error) {
    return handleServerError(error, res);
  }
});

export const editUser = catchAsyncErrors(async (req, res, next) => {
  // If username in params (admin editing), else get from cookie (done in authController middleware)
  let username;
  if (req.params.username) {
    username = decodeURIComponent(req.params.username);
  } else {
    username = req.username;
  }
  console.log(`========== Editing User: <${username}>`);

  const { email, password, groups, isActive } = req.body;
  console.log(req.body);

  // Begin pushing queries to execute
  const queries = [];
  if (email !== undefined) {
    queries.push([
      `UPDATE users SET email = ? WHERE username = ?`,
      [email === "" ? null : email, username]
    ]);
    console.log(`Added query: Update email <${email}>`);
  }

  if (password) {
    const passwordHash = await bCrypt.hash(password, 10);
    queries.push([
      `UPDATE users SET password = ? WHERE username = ?`,
      [passwordHash, username]
    ]);
    console.log("Added query: Update passwordHash");
  }

  if (req.params.username) {
    let groupsStr = null;
    if (groups) {
      if (Array.isArray(groups)) {
        groupsStr = groups.join("/");
      } else {
        groupsStr = groups;
      }

      if (groupsStr === "") {
        groupsStr = null;
      }
      queries.push([
        `UPDATE users SET \`groups\` = ? WHERE username = ?`,
        [groupsStr, username]
      ]);
      console.log(`Added query: Set user's groups <${groupsStr}>`);
    }

    if (isActive) {
      const isActiveBool = isActive === "active" ? true : false;
      queries.push([
        `UPDATE users SET is_active = ? WHERE username = ?`,
        [isActiveBool, username]
      ]);
      console.log(`Added query: Update user's status <${isActive}>`);
    }
  }

  // Run queries
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
      message: "Successfully edited user"
    });
  } catch (error) {
    console.log("Transaction failed");
    await connection.rollback();
    console.log("Transaction rolled back");
    connection.release();
    return handleServerError(error, res);
  }
});
