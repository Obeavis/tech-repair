import { describe, expect, it } from "vitest";

import type { Actor } from "@/domain/actor";
import {
  admin,
  customer,
  makeTicket,
  otherCustomer,
  otherTechnician,
  pendingEstimate,
  technician,
} from "@/domain/ticket/test-helpers";
import { assertCanTransition, isFinal } from "@/domain/ticket/transitions";
import { TICKET_STATUSES, type TicketStatus } from "@/domain/ticket/types";

type Mover = "staff" | "customer" | "admin";
type Edge = [TicketStatus, TicketStatus, Mover];

// Mirrors the status diagram in the README.
const EDGES: Edge[] = [
  ["new", "diagnosing", "staff"],
  ["new", "cancelled", "staff"],
  ["diagnosing", "awaiting_approval", "staff"],
  ["diagnosing", "in_repair", "staff"],
  ["diagnosing", "awaiting_parts", "staff"],
  ["diagnosing", "declined", "staff"],
  ["diagnosing", "cancelled", "staff"],
  ["awaiting_approval", "in_repair", "customer"],
  ["awaiting_approval", "awaiting_parts", "customer"],
  ["awaiting_approval", "declined", "customer"],
  ["awaiting_approval", "cancelled", "admin"],
  ["awaiting_parts", "in_repair", "staff"],
  ["awaiting_parts", "cancelled", "staff"],
  ["in_repair", "awaiting_approval", "staff"],
  ["in_repair", "awaiting_parts", "staff"],
  ["in_repair", "ready_for_pickup", "staff"],
  ["in_repair", "cancelled", "admin"],
  ["ready_for_pickup", "completed", "staff"],
];

const ALLOWED: Record<Mover, Actor[]> = {
  staff: [technician, admin],
  customer: [customer],
  admin: [admin],
};

const FORBIDDEN: Record<Mover, Actor[]> = {
  staff: [customer],
  customer: [technician, admin],
  admin: [technician, customer],
};

function ticketIn(status: TicketStatus) {
  return makeTicket({ status, estimate: pendingEstimate });
}

function statusOf(run: () => void) {
  try {
    run();
  } catch (error) {
    return (error as { status?: number }).status;
  }
  return null;
}

describe("assertCanTransition", () => {
  it.each(EDGES)("allows %s -> %s for the right actor", (from, to, mover) => {
    for (const actor of ALLOWED[mover]) {
      expect(() =>
        assertCanTransition(actor, ticketIn(from), to),
      ).not.toThrow();
    }
  });

  it.each(EDGES)(
    "answers 403 for %s -> %s to the wrong actor",
    (from, to, mover) => {
      for (const actor of FORBIDDEN[mover]) {
        expect(
          statusOf(() => assertCanTransition(actor, ticketIn(from), to)),
        ).toBe(403);
      }
    },
  );

  it("answers 422 for every move that is not in the diagram", () => {
    const allowed = new Set(EDGES.map(([from, to]) => `${from}>${to}`));
    for (const from of TICKET_STATUSES) {
      for (const to of TICKET_STATUSES) {
        if (allowed.has(`${from}>${to}`)) continue;
        expect(
          statusOf(() => assertCanTransition(admin, ticketIn(from), to)),
        ).toBe(422);
      }
    }
  });

  it("answers 404 when the actor cannot see the ticket", () => {
    const ticket = ticketIn("new");
    for (const actor of [otherTechnician, otherCustomer]) {
      expect(
        statusOf(() => assertCanTransition(actor, ticket, "diagnosing")),
      ).toBe(404);
    }
  });

  it("requires a pending estimate before asking for approval", () => {
    for (const estimate of [
      null,
      { ...pendingEstimate, approval: "approved" as const },
    ]) {
      const ticket = makeTicket({ status: "diagnosing", estimate });
      expect(
        statusOf(() =>
          assertCanTransition(technician, ticket, "awaiting_approval"),
        ),
      ).toBe(422);
    }
  });
});

describe("isFinal", () => {
  it("treats completed, declined and cancelled as final", () => {
    expect(TICKET_STATUSES.filter(isFinal)).toEqual([
      "completed",
      "declined",
      "cancelled",
    ]);
  });
});
