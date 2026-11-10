import { type Actor, isStaff } from "@/domain/actor";
import { assertCanView } from "@/domain/ticket/permissions";
import type { Ticket, TicketStatus } from "@/domain/ticket/types";
import { AppError } from "@/lib/app-error";

type Mover = "staff" | "customer" | "admin";

const TRANSITIONS: Record<
  TicketStatus,
  Partial<Record<TicketStatus, Mover>>
> = {
  new: { diagnosing: "staff", cancelled: "staff" },
  diagnosing: {
    awaiting_approval: "staff",
    in_repair: "staff",
    awaiting_parts: "staff",
    declined: "staff",
    cancelled: "staff",
  },
  awaiting_approval: {
    in_repair: "customer",
    awaiting_parts: "customer",
    declined: "customer",
    cancelled: "admin",
  },
  awaiting_parts: { in_repair: "staff", cancelled: "staff" },
  in_repair: {
    awaiting_approval: "staff",
    awaiting_parts: "staff",
    ready_for_pickup: "staff",
    cancelled: "admin",
  },
  ready_for_pickup: { completed: "staff" },
  completed: {},
  declined: {},
  cancelled: {},
};

function mayMove(mover: Mover, actor: Actor) {
  if (mover === "staff") return isStaff(actor);
  return actor.role === mover;
}

export function isFinal(status: TicketStatus) {
  return Object.keys(TRANSITIONS[status]).length === 0;
}

export function assertCanTransition(
  actor: Actor,
  ticket: Ticket,
  to: TicketStatus,
) {
  assertCanView(actor, ticket);

  const mover = TRANSITIONS[ticket.status][to];
  if (!mover) {
    throw new AppError(
      422,
      `A ticket cannot move from ${ticket.status} to ${to}`,
    );
  }
  if (!mayMove(mover, actor)) {
    throw new AppError(403, "You cannot make this status change");
  }
  if (to === "awaiting_approval" && ticket.estimate?.approval !== "pending") {
    throw new AppError(422, "Add an estimate before asking for approval");
  }
}
