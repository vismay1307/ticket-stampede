import express from "express";
import purchaseRoutes from "./routes/purchase.routes.js";

const app = express();

app.use(express.json());

app.use("/api", purchaseRoutes);

export default app;