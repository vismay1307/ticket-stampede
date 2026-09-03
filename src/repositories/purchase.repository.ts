import { eq } from "drizzle-orm";
import { purchaseRequests } from "../db/schema.js";

export async function findPurchaseByIdempotencyKey(
  tx: any,
  idempotencyKey: string
) {
  const result = await tx
    .select()
    .from(purchaseRequests)
    .where(eq(purchaseRequests.idempotencyKey, idempotencyKey))
    .limit(1);

  return result[0];
}

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

export async function updatePurchaseStatus(
  tx: any,
  purchaseId: number,
  status: string
) {
  const result = await tx
    .update(purchaseRequests)
    .set({ status })
    .where(eq(purchaseRequests.id, purchaseId))
    .returning();

  return result[0];
}