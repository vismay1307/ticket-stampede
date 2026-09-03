import { sales } from "../db/schema.js";

export async function createSale(
  tx: any,
  purchaseRequestId: number,
  ticketId: number,
  userId: string,
  quantity: number,
  totalAmount: number
) {
  const result = await tx
    .insert(sales)
    .values({
      purchaseRequestId,
      ticketId,
      userId,
      quantity,
      totalAmount,
    })
    .returning();

  return result[0];
}