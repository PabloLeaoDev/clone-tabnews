import orchestrator from "test/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("POST api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status", {
        method: "POST",
      });
      expect(response.status).toBe(405);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "MethodNotAllowedError",
        message: "A not allowed method was used on this endpoint",
        action: "Verify your request method is valid for this endpoint",
        status_code: 405,
      });
    });
  });
});
