import orchestrator from "test/orchestrator.js";
import { version as uuidVersion } from "uuid";
import { requester } from "test/requester.js";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await requester("/api/v1/users", {
        method: "POST",
        body: {
          username: "username-test",
          email: "test@user.com",
          password: "password123",
        },
      });

      const responseBody = await response.json();

      expect(response.status).toBe(201);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        email: responseBody.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("username-test");
      const correctPasswordMatch = await password.compare(
        "password123",
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        "wrongPassword123",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicated 'username'", async () => {
      const response1 = await requester("/api/v1/users", {
        method: "POST",
        body: {
          username: "duplicated-username",
          email: "test1@email.com",
          password: "password123",
        },
      });

      expect(response1.status).toBe(201);

      const response2 = await requester("/api/v1/users", {
        method: "POST",
        body: {
          username: "Duplicated-username",
          email: "test2@email.com",
          password: "password123",
        },
      });

      expect(response2.status).toBe(400);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "Username already registered",
        action: "Choose another username",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      const response1 = await requester("/api/v1/users", {
        method: "POST",
        body: {
          username: "duplicated-email",
          email: "test@email.com",
          password: "password123",
        },
      });

      expect(response1.status).toBe(201);

      const response2 = await requester("/api/v1/users", {
        method: "POST",
        body: {
          username: "duplicated-email1",
          email: "Test@email.com",
          password: "password123",
        },
      });

      expect(response2.status).toBe(400);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "Email already registered",
        action: "Choose another email",
        status_code: 400,
      });
    });
  });
});
