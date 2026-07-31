import orchestrator from "test/orchestrator.js";
import { requester } from "test/requester.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("PUT api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Running pending migrations", async () => {
      const response = await requester("/api/v1/migrations", {
        method: "PUT",
      });

      expect(response.status).toBe(405);

      const responseBody = await response.json();

      console.log(responseBody);

      expect(responseBody).toEqual({
        name: "MethodNotAllowedError",
        message: "A not allowed method was used on this endpoint",
        action: "Verify your request method is valid for this endpoint",
        status_code: 405,
      });
    });
  });
});
