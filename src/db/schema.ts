import {
  pgTable,
  bigserial,
  bigint,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const tickets = pgTable("tickets", {
  id: bigserial("id", { mode: "number" }).primaryKey(),

  eventName: text("event_name").notNull(),

  totalQuantity: integer("total_quantity").notNull(),

  availableQuantity: integer("available_quantity").notNull(),

  price: integer("price").notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const purchaseRequests = pgTable("purchase_requests", {
  id: bigserial("id", { mode: "number" }).primaryKey(),

  ticketId: bigint("ticket_id", {
    mode: "number",
  })
    .notNull()
    .references(() => tickets.id),

  userId: text("user_id").notNull(),

  quantity: integer("quantity").notNull(),

  status: text("status").notNull(),

  idempotencyKey: text("idempotency_key").notNull().unique(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const sales = pgTable("sales", {
  id: bigserial("id", { mode: "number" }).primaryKey(),

  purchaseRequestId: bigint("purchase_request_id", {
    mode: "number",
  })
    .notNull()
    .references(() => purchaseRequests.id),

  ticketId: bigint("ticket_id", {
    mode: "number",
  })
    .notNull()
    .references(() => tickets.id),

  userId: text("user_id").notNull(),

  quantity: integer("quantity").notNull(),

  totalAmount: integer("total_amount").notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});