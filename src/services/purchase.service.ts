import { db } from "../db/client.js";

import {
  findTicketForUpdate,
  decrementTicketQuantity,
  findTicketById,
  incrementTicketQuantity,
} from "../repositories/ticket.repository.js";
import { processPayment } from "./payment.service.js";
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
  idempotencyKey: string,
) {
  return db.transaction(async (tx) => {
    // 1. Check idempotency
    const existingPurchase = await findPurchaseByIdempotencyKey(
      tx,
      idempotencyKey,
    );

    if (existingPurchase) {
      return {
        purchase: existingPurchase,
        duplicate: true,
      };
    }

    // 2. Ticket ko lock karke nikalo
    const ticket = await findTicketForUpdate(tx, ticketId);

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
    const updatedTicket = await decrementTicketQuantity(tx, ticketId, quantity);

    // 6. Purchase record create
    const purchase = await createPurchaseRequest(
      tx,
      ticketId,
      userId,
      quantity,
      idempotencyKey,
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

export async function completePurchase(purchaseId: number) {
  return db.transaction(async (tx) => {
    // 1. Purchase ko SUCCESS karo
    const purchase = await updatePurchaseStatus(tx, purchaseId, "SUCCESS");

    if (!purchase) {
      throw new Error("Purchase not found");
    }

    // 2. Ticket nikalo
    const ticket = await findTicketById(tx, purchase.ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // 3. Actual ticket price use karo
    const totalAmount = ticket.price * purchase.quantity;

    // 4. Sales record create karo
    const sale = await createSale(
      tx,
      purchase.id,
      purchase.ticketId,
      purchase.userId,
      purchase.quantity,
      totalAmount,
    );

    return {
      purchase,
      sale,
    };
  });
}
export async function failPurchase(
  purchaseId: number
) {
  return db.transaction(async (tx) => {

    // 1. Purchase ko FAILED karo
    const purchase =
      await updatePurchaseStatus(
        tx,
        purchaseId,
        "FAILED"
      );

    if (!purchase) {
      throw new Error("Purchase not found");
    }

    // 2. Ticket quantity wapas lao
    const ticket =
      await incrementTicketQuantity(
        tx,
        purchase.ticketId,
        purchase.quantity
      );

    return {
      purchase,
      ticket,
    };
  });
}

export async function processPurchase(
  ticketId: number,
  userId: string,
  quantity: number,
  idempotencyKey: string
) {
  // Step 1: Ticket reserve karo + PENDING purchase create karo
  const result = await purchaseTicket(
    ticketId,
    userId,
    quantity,
    idempotencyKey
  );

  // Agar same request already process ho chuki hai
  if (result.duplicate) {
    return result;
  }

  const purchase = result.purchase;

  // Step 2: Payment
  const paymentSuccessful = await processPayment(
    result.ticket.price * quantity
  );

  // Step 3: Payment result
  if (paymentSuccessful) {
    return await completePurchase(purchase.id);
  }

  return await failPurchase(purchase.id);
}