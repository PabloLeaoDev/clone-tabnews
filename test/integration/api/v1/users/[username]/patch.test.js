import orchestrator from "test/orchestrator.js";
import password from "models/password";
import user from "models/user.js";
import { version as uuidVersion } from "uuid";
import { requester } from "test/requester.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await requester("/api/v1/users/nouser", {
        method: "PATCH",
      });

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "The username was not found in the system",
        action: "Verify if the username is correctly entered",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      const user1Response = await requester("/api/v1/users", {
        method: "POST",
        body: {
          username: "user1",
          email: "user1@email.com",
          password: "password123",
        },
      });

      expect(user1Response.status).toBe(201);

      const user2Response = await requester("/api/v1/users", {
        method: "POST",
        body: {
          username: "user2",
          email: "user2@email.com",
          password: "password123",
        },
      });

      expect(user2Response.status).toBe(201);

      const response = await requester("/api/v1/users/user2", {
        method: "PATCH",
        body: {
          username: "user1",
        },
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Username already registered",
        action: "Choose another username",
        status_code: 400,
      });
    });

    test("With the same 'username'", async () => {
      const userResponse = await requester("/api/v1/users", {
        method: "POST",
        body: {
          username: "user3",
          email: "user3@email.com",
          password: "password123",
        },
      });

      expect(userResponse.status).toBe(201);

      const response = await requester("/api/v1/users/user3", {
        method: "PATCH",
        body: {
          username: "user3",
        },
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Username is already yours",
        action: "Choose another username",
        status_code: 400,
      });
    });

    test("With invalid(s) user field(s)", async () => {
      const response = await requester("/api/v1/users/user3", {
        method: "PATCH",
        body: {
          invalid_field: "invalid_field",
        },
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Invalid user field(s)",
        action: "Choose valids fields to update the user",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const bodyToPost = {
        username: "uniqueUser1",
        email: "uniqueUser1@email.com",
        password: "password123",
      };

      const userResponse = await requester("/api/v1/users", {
        method: "POST",
        body: bodyToPost,
      });

      expect(userResponse.status).toBe(201);

      const newUsername = "uniqueUser2";

      const response = await requester("/api/v1/users/uniqueUser1", {
        method: "PATCH",
        body: {
          username: newUsername,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: newUsername,
        email: bodyToPost.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With duplicated 'email'", async () => {
      const email1Response = await requester("/api/v1/users", {
        method: "POST",
        body: {
          username: "email1",
          email: "email1@email.com",
          password: "password123",
        },
      });

      expect(email1Response.status).toBe(201);

      const email2Response = await requester("/api/v1/users", {
        method: "POST",
        body: {
          username: "email2",
          email: "email2@email.com",
          password: "password123",
        },
      });

      expect(email2Response.status).toBe(201);

      const response = await requester("/api/v1/users/email2", {
        method: "PATCH",
        body: {
          email: "email1@email.com",
        },
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Email already registered",
        action: "Choose another email",
        status_code: 400,
      });
    });

    test("With unique 'email'", async () => {
      const bodyToPost = {
        username: "uniqueEmail1",
        email: "uniqueEmail1@email.com",
        password: "password123",
      };

      const userResponse = await requester("/api/v1/users", {
        method: "POST",
        body: bodyToPost,
      });

      expect(userResponse.status).toBe(201);

      const newEmail = "uniqueEmail2@email.com";

      const response = await requester("/api/v1/users/uniqueEmail1", {
        method: "PATCH",
        body: {
          email: newEmail,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: bodyToPost.username,
        email: newEmail,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const bodyToPost = {
        username: "newPassword1",
        email: "newPassword1@email.com",
        password: "password123",
      };

      const userResponse = await requester("/api/v1/users", {
        method: "POST",
        body: bodyToPost,
      });

      expect(userResponse.status).toBe(201);

      const newPassword = "newPassword123";

      const response = await requester("/api/v1/users/newPassword1", {
        method: "PATCH",
        body: {
          password: newPassword,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: bodyToPost.username,
        email: bodyToPost.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(bodyToPost.username);
      const correctPasswordMatch = await password.compare(
        newPassword,
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        bodyToPost.password,
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
