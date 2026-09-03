import { purchaseTicket } from "../services/purchase.service.js";

async function test() {
  try {
    const result = await purchaseTicket(1, "user-1", 1);

    console.log("Purchase successful:");
    console.log(result);
  } catch (error) {
    console.error("Purchase failed:", error);
  }
}

test();