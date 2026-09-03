import { purchaseRequests } from "../db/schema.js";
export async function createPurchaseRequest(
  tx: any,
  ticketId: number,
  userId: string,
  quantity: number,
  idempotencyKey: string
) {
  const result = await tx
    .insert(purchaseRequests)
    .values({
      ticketId,
      userId,
      quantity,
      status: "PENDING",
      idempotencyKey,
    })
    .returning();

  return result[0];
}