import orchestrator from "test/orchestrator.js";
import { version as uuidVersion } from "uuid";
import { requester } from "test/requester.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const response1 = await requester("/api/v1/users", {
        method: "POST",
        body: {
          username: "SameCase",
          email: "same.case@email.com",
          password: "password123",
        },
      });

      expect(response1.status).toBe(201);

      const response2 = await requester("/api/v1/users/SameCase");

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "SameCase",
        email: "same.case@email.com",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });
      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      const response1 = await requester("/api/v1/users", {
        method: "POST",
        body: {
          username: "DiffCase",
          email: "diff.case@email.com",
          password: "password123",
        },
      });

      expect(response1.status).toBe(201);

      const response2 = await requester("/api/v1/users/diffcase");

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "DiffCase",
        email: "diff.case@email.com",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });
      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });

    test("With nonexistent username", async () => {
      const response2 = await requester("/api/v1/users/nouser");

      expect(response2.status).toBe(404);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "NotFoundError",
        message: "The username was not found in the system",
        action: "Verify if the username is correctly entered",
        status_code: 404,
      });
    });
  });
});
