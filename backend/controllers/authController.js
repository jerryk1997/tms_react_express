// Node modules
import bCrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// Custom modules
import db from "../db.js";
import {
  catchAsyncErrors,
  handleServerError
} from "../middlewares/errorHandler.js";

dotenv.config({ path: "../config/.env" });

export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { username, password } = req.body;
  console.log(`========== Logging in for User: ${username}`);

  // Fetch user
  try {
    var [rows] = await db.execute(
      `
      SELECT 
        username,
        password,
        is_active
      FROM users
      WHERE username = ?
    `,
      [username]
    );
  } catch (error) {
    return handleServerError(error, res);
  }
  console.log("User credentials fetched");

  // PasswordHash or empty if username wrong
  const passwordHash = rows[0] ? rows[0].password : "";
  const isActive = rows[0] ? rows[0].is_active : "";

  if (!isActive) {
    console.log("User is not active");
    return res.clearCookie("session").status(401).json({
      error: "Login unsuccessful"
    });
  }

  // Check credentials
  const passwordMatch = await bCrypt.compare(password, passwordHash);
  if (passwordMatch) {
    // Build JWT for user session
    const payload = { username: rows[0].username };
    const options = { expiresIn: "1h" };
    const sessionToken = jwt.sign(payload, process.env.JWT_SECRET, options);
    console.log("Authenticated, returning JWT");
    return res
      .cookie("session", sessionToken, {
        httpOnly: true,
        maxAge: 3600000
      })
      .status(200)
      .json({
        message: "Login successful"
      });
  } else {
    return res.clearCookie("session").status(401).json({
      error: "Login unsuccessful"
    });
  }
});

export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  console.log("\n\n========== Logging out");
  return res.clearCookie("session").json({
    message: "Logout successful"
  });
});

/**
 * Middleware function to verify a user's session based on a JWT token in user's cookie.
 * Users's username will be assigned to req object for easy access.
 *
 * @returns {void}
 */
export const verifyUserSession = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies["session"];
  //console.log("\n\n========== Verifying user session");
  try {
    //console.log("Decoding JWT");
    //console.log(`${token}`);
    //console.log(`${process.env.JWT_SECRET}`);
    var decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(decodedToken);
  } catch (error) {
    console.error(`JWT verification error: ${error.message}`);
    return res.status(401).json({
      error: "Please login again."
    });
  }
  const username = decodedToken.username;
  //console.log(`Assigned username <${username}>`);

  // Get user
  try {
    //console.log(`Getting user`);
    var user = (
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
    )[0][0];
    //console.log(`${user}`);
  } catch (error) {
    handleServerError(error, res);
  }

  //console.log("After");

  if (!user || !user.is_active) {
    return res.status(401).clearCookie("session").json({
      error: "Unauthorised user"
    });
  }

  //console.log(`JWT verified for User: ${username}`);
  req.username = username;
  next();
});

/**
 * Middleware to verify user authorization based on the specified group.
 *
 * This middleware checks if the user is authorized to access a route based on their group membership.
 * If the user is not a member of the specified group, an unauthorised response is sent.
 *
 * @param {string} authorisedGroup - The group name that the user must be a member of to access the route.
 * @returns {Function} - Express middleware function.
 */
export const verifyUserAuthorised = authorisedGroup => {
  return catchAsyncErrors(async (req, res, next) => {
    console.log("\n\n========== Verifying User Authority");
    console.log(`User must be <${authorisedGroup}>`);

    const decodedAuthorisedGroup = decodeURIComponent(authorisedGroup);
    const isAuthorised = await Checkgroup(req.username, decodedAuthorisedGroup);
    if (!isAuthorised) {
      return res.status(401).end();
    }

    console.log("User is authorised");
    next();
  });
};

/**
 * Check if a user belongs to the specified group.
 *
 * This function checks whether the user with the given username is a member of the specified group.
 *
 * @param {string} userid - The username of the user to check.
 * @param {string} groupname - The group name to check membership in.
 * @returns {Promise<boolean>} A Promise that resolves to a Boolean indicating if the user is a member of the group.
 */
export const Checkgroup = async (userid, groupname) => {
  const userData = (
    await db.execute(
      `
      SELECT
        \`groups\`
      FROM users
      WHERE username = ?
    `,
      [userid]
    )
  )[0][0];
  const userGroups = userData.groups;
  if (userGroups !== null) {
    return userGroups.split("/").includes(groupname);
  } else {
    return false;
  }
};
