import type { Estimate, Ticket, TicketStatus } from "@/domain/ticket/types";
import { AppError } from "@/lib/app-error";

const REVISABLE: TicketStatus[] = [
  "diagnosing",
  "awaiting_approval",
  "in_repair",
];

export function reviseEstimate(
  ticket: Ticket,
  amountCents: number,
): { estimate: Estimate; status: TicketStatus } {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new AppError(422, "The estimate must be a positive amount");
  }
  if (!REVISABLE.includes(ticket.status)) {
    throw new AppError(422, "The estimate cannot be changed at this stage");
  }

  const current = ticket.estimate;
  if (current?.approval === "approved" && current.amountCents === amountCents) {
    return { estimate: current, status: ticket.status };
  }

  const estimate: Estimate = {
    amountCents,
    approval: "pending",
    declineReason: null,
  };
  // Work already under way must be approved again before it continues.
  const status =
    ticket.status === "in_repair" ? "awaiting_approval" : ticket.status;
  return { estimate, status };
}

function assertPending(estimate: Estimate | null): Estimate {
  if (estimate?.approval !== "pending") {
    throw new AppError(422, "There is no estimate waiting for a decision");
  }
  return estimate;
}

export function approveEstimate(estimate: Estimate | null): Estimate {
  return { ...assertPending(estimate), approval: "approved" };
}

export function declineEstimate(
  estimate: Estimate | null,
  reason: string,
): Estimate {
  const trimmed = reason.trim();
  if (!trimmed) throw new AppError(422, "Tell us why you are declining");
  return {
    ...assertPending(estimate),
    approval: "declined",
    declineReason: trimmed,
  };
}
