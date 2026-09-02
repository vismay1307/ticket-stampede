import { db } from "../db/client.js";
import {
  findTicketForUpdate,
  decrementTicketQuantity,
} from "../repositories/ticket.repository.js";

export async function purchaseTicket(
  ticketId: number,
  userId: string,
  quantity: number
) {
  return db.transaction(async (tx) => {
    const ticket = await findTicketForUpdate(tx, ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    if (quantity <= 0) {
      throw new Error("Invalid quantity");
    }

    if (ticket.availableQuantity < quantity) {
      throw new Error("Not enough tickets available");
    }

    const updatedTicket = await decrementTicketQuantity(
      tx,
      ticketId,
      quantity
    );

    return {
      ticket: updatedTicket,
      userId,
      quantity,
    };
  });
}