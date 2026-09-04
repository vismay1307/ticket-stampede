const TOTAL_REQUESTS = 10000;
const CONCURRENCY = 10000;

const API_URL = "http://127.0.0.1:3000/api/purchases";

async function sendRequest(i: number) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": `load-10k-1000-${i}`,
      },
      body: JSON.stringify({
        ticketId: 2,
        userId: `load-user-${i}`,
        quantity: 1,
      }),
    });

    const data = await response.json();

    return {
      status: response.status,
      success: data?.purchase?.status === "SUCCESS",
      duplicate: data?.duplicate === true,
    };
  } catch {
    return {
      status: 0,
      success: false,
      duplicate: false,
    };
  }
}

async function main() {
  console.log(
    `Sending ${TOTAL_REQUESTS} requests with ${CONCURRENCY} concurrency...`
  );

  const start = Date.now();
  const results = [];

  for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENCY) {
    const batch = Array.from(
      { length: Math.min(CONCURRENCY, TOTAL_REQUESTS - i) },
      (_, index) => sendRequest(i + index)
    );

    const batchResults = await Promise.all(batch);
    results.push(...batchResults);

    if ((i + batch.length) % 1000 === 0) {
      console.log(`Completed: ${i + batch.length}/${TOTAL_REQUESTS}`);
    }
  }

  const duration = Date.now() - start;

  const successful = results.filter((r) => r.success).length;
  const duplicates = results.filter((r) => r.duplicate).length;
  const failed = results.length - successful - duplicates;
  const networkErrors = results.filter((r) => r.status === 0).length;

  console.log("\n===== CONTROLLED LOAD TEST =====");
  console.log("Total requests:", results.length);
  console.log("Successful:", successful);
  console.log("Duplicates:", duplicates);
  console.log("Failed:", failed);
  console.log("Network errors:", networkErrors);
  console.log("Total time:", `${duration} ms`);
  console.log(
    "Requests/sec:",
    (TOTAL_REQUESTS / (duration / 1000)).toFixed(2)
  );
}

main();