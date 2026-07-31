export async function requester(
  route = "",
  config = {
    method: "",
    headers: {},
    body: {},
  },
) {
  if (!process.env.APP_HOST) throw new Error("APP_HOST is not defined");

  if (!route || typeof route !== "string")
    throw new Error("Route is not defined");

  const method = config?.method?.toUpperCase() || "GET";

  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method))
    throw new Error("Invalid method");

  let response;

  if (method === "GET") {
    response = await fetch(`${process.env.APP_HOST}${route}`);
    return response;
  }

  const headers = {
    "Content-Type": config?.headers
      ? config.headers["Content-Type"]
      : "application/json",
    ...config.headers,
  };

  response = await fetch(`${process.env.APP_HOST}${route}`, {
    method,
    headers,
    body: JSON.stringify(config?.body || {}),
  });

  return response;
}
