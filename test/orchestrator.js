import retry from "async-retry";

async function waitForAllServices() {
  const fetchStatusPage = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (!response.ok) throw Error(`HTTP Error ${response.status}`);
      await response.json();
    } catch (err) {
      throw err;
    }
  };

  const waitForWebServer = async () => {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
      onRetry: (err, attempt) => {
        console.log(
          `Attempt ${attempt} - Failed to fetch status page: ${err.message}`,
        );
      },
    });
  };

  await waitForWebServer();
}

export default {
  waitForAllServices,
};
