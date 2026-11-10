import { z } from "zod";

import type { Actor } from "@/domain/actor";
import { DEVICE_TYPES, type Ticket } from "@/domain/ticket/types";
import { AppError } from "@/lib/app-error";
import { parseInput } from "@/lib/parse-input";
import type { Repository } from "@/server/repository/repository";

export const newTicketSchema = z.object({
  deviceType: z.enum(DEVICE_TYPES, "Choose a device type"),
  deviceModel: z
    .string()
    .trim()
    .min(1, "Enter the device model")
    .max(80, "Use 80 characters or fewer"),
  serialNumber: z
    .string()
    .trim()
    .max(60, "Use 60 characters or fewer")
    .transform((value) => value || null),
  problem: z
    .string()
    .trim()
    .min(10, "Describe the problem in at least 10 characters")
    .max(1000, "Use 1000 characters or fewer"),
});

export async function createTicket(
  repo: Repository,
  actor: Actor,
  input: unknown,
): Promise<Ticket> {
  if (actor.role !== "customer") {
    throw new AppError(403, "Only customers can open repair requests");
  }
  const data = parseInput(newTicketSchema, input);
  const ticket = await repo.tickets.create({ ...data, customerId: actor.id });
  await repo.statusChanges.add({
    ticketId: ticket.id,
    actorId: actor.id,
    from: null,
    to: "new",
  });
  return ticket;
}
