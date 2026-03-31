import retry from "async-retry";

async function waitForAllServices() {
  const waitForWebServer = async () => {
    const fetchStatusPage = async () => {
      const response = await fetch("http://localhost:3000/api/v1/status"),
        responseBody = await response.json();
    };

    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });
  };

  await waitForWebServer();
}

export default {
  waitForAllServices,
};
