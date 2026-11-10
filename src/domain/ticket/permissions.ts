import { type Actor, isStaff } from "@/domain/actor";
import type { Ticket } from "@/domain/ticket/types";
import { AppError } from "@/lib/app-error";

export function canView(actor: Actor, ticket: Ticket) {
  switch (actor.role) {
    case "admin":
      return true;
    case "technician":
      return ticket.technicianId === actor.id;
    case "customer":
      return ticket.customerId === actor.id;
  }
}

// A 404 instead of a 403, so ticket ids of other customers are not revealed.
export function assertCanView(actor: Actor, ticket: Ticket) {
  if (!canView(actor, ticket)) throw new AppError(404, "Ticket not found");
}

export function canSeeInternalNotes(actor: Actor, ticket: Ticket) {
  return isStaff(actor) && canView(actor, ticket);
}

export function assertCanManage(actor: Actor, ticket: Ticket) {
  assertCanView(actor, ticket);
  if (!isStaff(actor)) {
    throw new AppError(403, "Only the shop team can do this");
  }
}

export function assertCanAssignTechnician(actor: Actor, technician: Actor) {
  if (actor.role !== "admin") {
    throw new AppError(403, "Only an admin can assign technicians");
  }
  if (technician.role !== "technician") {
    throw new AppError(422, "The assignee must be a technician");
  }
}
