import { eq, sql } from "drizzle-orm";
import { tickets } from "../db/schema.js";

export async function findTicketForUpdate(
  tx: any,
  ticketId: number
) {
  const result = await tx
    .select()
    .from(tickets)
    .where(eq(tickets.id, ticketId))
    .for("update");

  return result[0];
}

export async function decrementTicketQuantity(
  tx: any,
  ticketId: number,
  quantity: number
) {
  const result = await tx
    .update(tickets)
    .set({
      availableQuantity: sql`${tickets.availableQuantity} - ${quantity}`,
    })
    .where(eq(tickets.id, ticketId))
    .returning();

  return result[0];
}