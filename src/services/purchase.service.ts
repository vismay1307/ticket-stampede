import { db } from "../db/client.js";

import {
  findTicketForUpdate,
  decrementTicketQuantity,
} from "../repositories/ticket.repository.js";

import {
  createPurchaseRequest,
  findPurchaseByIdempotencyKey,
  updatePurchaseStatus,
} from "../repositories/purchase.repository.js";

import { createSale } from "../repositories/sales.repository.js";

// =====================================================
// 1. CREATE PURCHASE REQUEST
// =====================================================

export async function purchaseTicket(
  ticketId: number,
  userId: string,
  quantity: number,
  idempotencyKey: string
) {
  return db.transaction(async (tx) => {

    // 1. Check idempotency
    const existingPurchase =
      await findPurchaseByIdempotencyKey(
        tx,
        idempotencyKey
      );

    if (existingPurchase) {
      return {
        purchase: existingPurchase,
        duplicate: true,
      };
    }

    // 2. Ticket ko lock karke nikalo
    const ticket =
      await findTicketForUpdate(tx, ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // 3. Quantity validate karo
    if (quantity <= 0) {
      throw new Error("Invalid quantity");
    }

    // 4. Availability check
    if (ticket.availableQuantity < quantity) {
      throw new Error("Not enough tickets available");
    }

    // 5. Inventory decrease
    const updatedTicket =
      await decrementTicketQuantity(
        tx,
        ticketId,
        quantity
      );

    // 6. Purchase record create
    const purchase =
      await createPurchaseRequest(
        tx,
        ticketId,
        userId,
        quantity,
        idempotencyKey
      );

    // 7. Final result
    return {
      purchase,
      ticket: updatedTicket,
      duplicate: false,
    };
  });
}


// =====================================================
// 2. COMPLETE PURCHASE
// =====================================================

export async function completePurchase(
  purchaseId: number
) {
  return db.transaction(async (tx) => {

    // 1. Purchase ko SUCCESS karo
    const purchase =
      await updatePurchaseStatus(
        tx,
        purchaseId,
        "SUCCESS"
      );

    if (!purchase) {
      throw new Error("Purchase not found");
    }

    // 2. Abhi testing ke liye price ₹500
    const totalAmount =
      500 * purchase.quantity;

    // 3. Sales table mein record create karo
    const sale =
      await createSale(
        tx,
        purchase.id,
        purchase.ticketId,
        purchase.userId,
        purchase.quantity,
        totalAmount
      );

    // 4. Final result
    return {
      purchase,
      sale,
    };
  });
}