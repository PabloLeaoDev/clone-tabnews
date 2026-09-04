import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);
  return userFound;
}

async function runSelectQuery(username = "") {
  const result = await database.query({
    text: `
          SELECT
            *
          FROM 
            users 
          WHERE 
            LOWER(username) = LOWER($1)
          LIMIT
            1
        ;`,
    values: [username],
  });

  if (result.rowCount === 0) {
    const notFoundErrorErrorObject = new NotFoundError({
      message: "The username was not found in the system",
      action: "Verify if the username is correctly entered",
    });
    throw notFoundErrorErrorObject;
  }

  return result.rows[0];
}

async function create(userInputValues) {
  await validateUsername(userInputValues.username);
  await validateUserEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;
}

async function update(username = "", userInputValues = {}) {
  validateUserFields(Object.keys(userInputValues));

  const currentUser = await user.findOneByUsername(username);

  if ("username" in userInputValues) {
    if (username.toLowerCase() === userInputValues.username.toLowerCase()) {
      const validationErrorObject = new ValidationError({
        message: "Username is already yours",
        action: "Choose another username",
      });
      throw validationErrorObject;
    }

    await validateUsername(userInputValues.username);
  }

  if ("email" in userInputValues)
    await validateUserEmail(userInputValues.email);

  if ("password" in userInputValues)
    await hashPasswordInObject(userInputValues);

  const updatedUser = await runUpdateQuery(currentUser.id, userInputValues);

  return updatedUser;
}

function validateUserFields(userFields = []) {
  const allowedFields = ["username", "email", "password"];

  if (userFields.some((f) => !allowedFields.includes(f))) {
    const validationErrorObject = new ValidationError({
      message: "Invalid user field(s)",
      action: "Choose valids fields to update the user",
    });
    throw validationErrorObject;
  }
}

async function validateUsername(username = "") {
  const result = await database.query({
    text: `
          SELECT
            username
          FROM 
            users 
          WHERE 
            LOWER(username) = LOWER($1)
        ;`,
    values: [username],
  });

  if (result.rowCount > 0) {
    const validationErrorObject = new ValidationError({
      message: "Username already registered",
      action: "Choose another username",
    });
    throw validationErrorObject;
  }
}

async function validateUserEmail(email = "") {
  const result = await database.query({
    text: `
        SELECT
          email 
        FROM 
          users 
        WHERE 
          LOWER(email) = LOWER($1)
      ;`,
    values: [email],
  });

  if (result.rowCount > 0) {
    const validationErrorObject = new ValidationError({
      message: "Email already registered",
      action: "Choose another email",
    });
    throw validationErrorObject;
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

async function runInsertQuery(userInputValues) {
  const result = await database.query({
    text: `
        INSERT INTO
          users (username, email, password) 
        VALUES 
          ($1, $2, $3) 
        RETURNING
          *
      ;`,
    values: [
      userInputValues.username,
      userInputValues.email,
      userInputValues.password,
    ],
  });

  return result.rows[0];
}

async function runUpdateQuery(userId, userInputValues) {
  let updateFields = "",
    updateValues = [];

  const userInputValuesMatrix = Object.entries(userInputValues);

  for (let i = 0; i < userInputValuesMatrix.length; i++) {
    updateFields += `${userInputValuesMatrix[i][0]} = $${i + 2}, `;
    updateValues.push(userInputValuesMatrix[i][1]);
  }

  const result = await database.query({
    text: `
        UPDATE
          users
        SET
          ${updateFields}
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      ;`,
    values: [userId, ...updateValues],
  });

  return result.rows[0];
}

const user = {
  create,
  findOneByUsername,
  update,
};

export default user;
