import { findTicketById } from "../repositories/ticket.repository.js";

async function test() {
  const ticket = await findTicketById(1);

  console.log("Ticket:", ticket);

  process.exit(0);
}

test();