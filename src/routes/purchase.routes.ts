import { Router } from "express";
import { purchaseController } from "../controllers/purchase.controller.js";

const router = Router();

router.post("/purchases", purchaseController);

export default router;