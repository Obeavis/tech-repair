import { z } from "zod";

import type { Actor } from "@/domain/actor";
import { approveEstimate, declineEstimate } from "@/domain/ticket/estimate";
import { assertCanView } from "@/domain/ticket/permissions";
import { assertCanTransition } from "@/domain/ticket/transitions";
import type { Ticket, TicketStatus } from "@/domain/ticket/types";
import { AppError } from "@/lib/app-error";
import { parseInput } from "@/lib/parse-input";
import type { Repository } from "@/server/repository/repository";

export const declineSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Tell us why you are declining")
    .max(500, "Use 500 characters or fewer"),
});

async function loadTicket(repo: Repository, actor: Actor, id: string) {
  const ticket = await repo.tickets.get(id);
  if (!ticket) throw new AppError(404, "Ticket not found");
  assertCanView(actor, ticket);
  return ticket;
}

async function applyDecision(
  repo: Repository,
  actor: Actor,
  ticket: Ticket,
  to: TicketStatus,
  estimate: Ticket["estimate"],
) {
  assertCanTransition(actor, ticket, to);
  const updated = await repo.tickets.update(ticket.id, {
    estimate,
    status: to,
  });
  await repo.statusChanges.add({
    ticketId: ticket.id,
    actorId: actor.id,
    from: ticket.status,
    to,
  });
  return updated;
}

// Approving sends the ticket to repair; the shop moves it to Awaiting parts if it has to wait for a part.
export async function approveTicketEstimate(
  repo: Repository,
  actor: Actor,
  ticketId: string,
): Promise<Ticket> {
  const ticket = await loadTicket(repo, actor, ticketId);
  const estimate = approveEstimate(ticket.estimate);
  return applyDecision(repo, actor, ticket, "in_repair", estimate);
}

export async function declineTicketEstimate(
  repo: Repository,
  actor: Actor,
  ticketId: string,
  input: unknown,
): Promise<Ticket> {
  const ticket = await loadTicket(repo, actor, ticketId);
  const { reason } = parseInput(declineSchema, input);
  const estimate = declineEstimate(ticket.estimate, reason);
  return applyDecision(repo, actor, ticket, "declined", estimate);
}
