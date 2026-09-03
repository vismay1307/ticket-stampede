import { db } from "../db/client.js";

import {
  findTicketForUpdate,
  decrementTicketQuantity,
} from "../repositories/ticket.repository.js";

import { createPurchaseRequest } from "../repositories/purchase.repository.js";

export async function purchaseTicket(
  ticketId: number,
  userId: string,
  quantity: number,
  idempotencyKey: string
) {
  return db.transaction(async (tx) => {

    // 1. Ticket ko lock karke nikalo
    const ticket = await findTicketForUpdate(tx, ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // 2. Quantity validate karo
    if (quantity <= 0) {
      throw new Error("Invalid quantity");
    }

    // 3. Availability check
    if (ticket.availableQuantity < quantity) {
      throw new Error("Not enough tickets available");
    }

    // 4. Inventory decrease
    const updatedTicket = await decrementTicketQuantity(
      tx,
      ticketId,
      quantity
    );

    // 5. Purchase record create
   const purchase = await createPurchaseRequest(
  tx,
  ticketId,
  userId,
  quantity,
  idempotencyKey
);

    // 6. Final result
    return {
      purchase,
      ticket: updatedTicket,
    };
  });
}