import type { Request, Response } from "express";
import { purchaseTicket } from "../services/purchase.service.js";

export async function purchaseController(
  req: Request,
  res: Response
) {
  try {
    const { ticketId, userId, quantity } = req.body;

    const idempotencyKey = req.header("Idempotency-Key");

    if (!idempotencyKey) {
      return res.status(400).json({
        message: "Idempotency-Key is required",
      });
    }

    const result = await purchaseTicket(
      ticketId,
      userId,
      quantity,
      idempotencyKey
    );

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Purchase failed",
    });
  }
}