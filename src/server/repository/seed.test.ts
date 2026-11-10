import { describe, expect, it } from "vitest";

import { isStaff } from "@/domain/actor";
import { pendingEstimate } from "@/domain/ticket/test-helpers";
import { assertCanTransition, isFinal } from "@/domain/ticket/transitions";
import type { TicketStatus } from "@/domain/ticket/types";
import { seedData } from "@/server/repository/seed";

const { users, tickets, messages, statusChanges } = seedData;
const userById = new Map(users.map((u) => [u.id, u]));

describe("seed data", () => {
  it("uses unique ids and emails", () => {
    for (const ids of [
      users.map((u) => u.id),
      users.map((u) => u.email),
      tickets.map((t) => t.id),
      messages.map((m) => m.id),
      statusChanges.map((c) => c.id),
    ]) {
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("links tickets to a customer and, when assigned, to a technician", () => {
    for (const ticket of tickets) {
      expect(userById.get(ticket.customerId)?.role).toBe("customer");
      if (ticket.technicianId) {
        expect(userById.get(ticket.technicianId)?.role).toBe("technician");
      }
    }
  });

  it("has the three roles", () => {
    const roles = new Set(users.map((u) => u.role));
    expect(roles).toEqual(new Set(["customer", "technician", "admin"]));
  });

  it("gives every ticket the estimate its status calls for", () => {
    const expected: Partial<Record<TicketStatus, string>> = {
      awaiting_approval: "pending",
      awaiting_parts: "approved",
      in_repair: "approved",
      ready_for_pickup: "approved",
      completed: "approved",
      declined: "declined",
    };
    for (const ticket of tickets) {
      const approval = expected[ticket.status];
      if (approval) expect(ticket.estimate?.approval).toBe(approval);
      if (ticket.estimate?.approval === "declined") {
        expect(ticket.estimate.declineReason).toBeTruthy();
      }
    }
  });

  it("only assigns a technician once a ticket is past new", () => {
    for (const ticket of tickets) {
      if (ticket.status !== "new" && ticket.status !== "cancelled") {
        expect(ticket.technicianId).not.toBeNull();
      }
    }
  });

  it("keeps the notes of staff only in internal notes", () => {
    for (const message of messages) {
      const author = userById.get(message.authorId)!;
      if (message.kind === "internal_note") expect(isStaff(author)).toBe(true);
      expect(tickets.some((t) => t.id === message.ticketId)).toBe(true);
    }
  });

  it("follows the status rules in every recorded status change", () => {
    for (const change of statusChanges) {
      const ticket = tickets.find((t) => t.id === change.ticketId)!;
      const actor = userById.get(change.actorId)!;
      const { from, to } = change;
      if (from === null) {
        expect(to).toBe("new");
        continue;
      }
      expect(() =>
        assertCanTransition(
          actor,
          { ...ticket, status: from, estimate: pendingEstimate },
          to,
        ),
      ).not.toThrow();
    }
  });

  it("ends each ticket's history at its current status", () => {
    for (const ticket of tickets) {
      const history = statusChanges.filter((c) => c.ticketId === ticket.id);
      expect(history.at(-1)?.to).toBe(ticket.status);
      expect(history.at(-1)?.createdAt).toBe(ticket.updatedAt);
    }
  });

  it("has a spread of open tickets for the dashboard", () => {
    const counts: Record<string, number> = {};
    for (const ticket of tickets.filter((t) => !isFinal(t.status))) {
      counts[ticket.status] = (counts[ticket.status] ?? 0) + 1;
    }
    expect(counts).toEqual({
      new: 2,
      diagnosing: 2,
      awaiting_approval: 2,
      awaiting_parts: 1,
      in_repair: 2,
      ready_for_pickup: 2,
    });
  });
});
