const TOTAL_REQUESTS = 10000;
const API_URL = "http://localhost:3000/api/purchases";

async function sendRequest(i: number) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": "same-request-001",
    },
    body: JSON.stringify({
      ticketId: 1,
      userId: "same-user",
      quantity: 1,
    }),
  });

  const data = await response.json();

  return {
    status: response.status,
    data,
  };
}

async function main() {
  console.log(
    `Sending ${TOTAL_REQUESTS} concurrent duplicate requests...`
  );

  const start = Date.now();

  const results = await Promise.all(
    Array.from(
      { length: TOTAL_REQUESTS },
      (_, i) => sendRequest(i)
    )
  );

  const duration = Date.now() - start;

  const successful = results.filter(
    (r) => r.data?.purchase?.status === "SUCCESS"
  ).length;

  const failed = results.filter(
    (r) => r.status >= 400
  ).length;

  const duplicates = results.filter(
    (r) => r.data?.duplicate === true
  ).length;

  console.log("\n===== DUPLICATE LOAD TEST =====");
  console.log("Total requests:", TOTAL_REQUESTS);
  console.log("Successful:", successful);
  console.log("Failed:", failed);
  console.log("Duplicates:", duplicates);
  console.log("Total time:", `${duration} ms`);
  console.log(
    "Requests/sec:",
    (TOTAL_REQUESTS / (duration / 1000)).toFixed(2)
  );
}

main();