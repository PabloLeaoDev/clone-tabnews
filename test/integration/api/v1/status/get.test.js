test("GET api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  // expect(response.status).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.updated_at).toBeDefined();
  expect(responseBody.dependencies.database).toBeDefined();
  expect(responseBody.dependencies.database).toHaveProperty("version");
  expect(responseBody.dependencies.database).toHaveProperty("max_connections");
  expect(responseBody.dependencies.database).toHaveProperty(
    "opened_connections",
  );

  console.log(responseBody);

  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();

  expect(responseBody.updated_at).toEqual(parsedUpdatedAt);
  expect(isNaN(responseBody.dependencies.database.version)).toBe(false);
  expect(
    Number.isInteger(
      Number(responseBody.dependencies.database.max_connections),
    ),
  ).toBe(true);
  expect(
    Number.isInteger(
      Number(responseBody.dependencies.database.opened_connections),
    ),
  ).toBe(true);
});
