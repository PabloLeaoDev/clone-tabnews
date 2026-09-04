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
      await orchestrator.createUser({
        username: "user1",
      });

      await orchestrator.createUser({
        username: "user2",
      });

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
      const username = "sameUsername";

      await orchestrator.createUser({
        username,
      });

      const response = await requester(`/api/v1/users/${username}`, {
        method: "PATCH",
        body: {
          username,
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
      const username = "invalidUserFields";

      await orchestrator.createUser({
        username,
      });

      const response = await requester(`/api/v1/users/${username}`, {
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
      const username = "uniqueUser1";

      const createdUser = await orchestrator.createUser({
        username,
      });

      const newUsername = "uniqueUser2";

      const response = await requester(`/api/v1/users/${username}`, {
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
        email: createdUser.email,
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
      await orchestrator.createUser({
        email: "email1@email.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "email2@email.com",
      });

      const response = await requester(
        `/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          body: {
            email: "email1@email.com",
          },
        },
      );

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
      const email = "uniqueEmail1@email.com";

      const createdUser = await orchestrator.createUser({
        email,
      });

      const newEmail = "uniqueEmail2@email.com";

      const response = await requester(
        `/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          body: {
            email: newEmail,
          },
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
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
      const createdUser = await orchestrator.createUser();
      const newPassword = "newPassword123";

      const response = await requester(
        `/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          body: {
            password: newPassword,
          },
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        email: createdUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(createdUser.username);
      const correctPasswordMatch = await password.compare(
        newPassword,
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        createdUser.password,
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
