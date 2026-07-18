import database from "infra/database.js";
import { ValidationError } from "infra/errors.js";

async function create(userInputValues) {
  await validateUsername(userInputValues.username);
  await validateUserEmail(userInputValues.email);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;
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
    console.log(result.rows[0]);
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

const user = {
  create,
};

export default user;
