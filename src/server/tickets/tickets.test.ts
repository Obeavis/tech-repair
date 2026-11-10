import { beforeEach, describe, expect, it } from "vitest";

import type { Actor } from "@/domain/actor";
import { AppError } from "@/lib/app-error";
import { createMemoryRepository } from "@/server/repository/memory-repository";
import type { Repository } from "@/server/repository/repository";
import { seedData } from "@/server/repository/seed";
import { createTicket } from "@/server/tickets/create-ticket";
import {
  approveTicketEstimate,
  declineTicketEstimate,
} from "@/server/tickets/decide-estimate";
import { getTicketDetail } from "@/server/tickets/get-ticket";
import { listTickets } from "@/server/tickets/list-tickets";
import { sendMessage } from "@/server/tickets/send-message";

const sarah: Actor = { id: "usr-sarah", role: "customer" };
const david: Actor = { id: "usr-david", role: "customer" };
const marco: Actor = { id: "usr-marco", role: "technician" };
const elena: Actor = { id: "usr-elena", role: "admin" };

const validTicket = {
  deviceType: "phone",
  deviceModel: "Pixel 8",
  serialNumber: "",
  problem: "The battery drains in a few hours",
};

let repo: Repository;
let awaitingId: string;

async function failure(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
}

beforeEach(async () => {
  repo = createMemoryRepository(seedData);
  const mine = await repo.tickets.list({ customerId: sarah.id });
  const pending = mine.find((t) => t.status === "awaiting_approval");
  if (!pending) throw new Error("Seed has no awaiting ticket for Sarah");
  awaitingId = pending.id;
});

describe("createTicket", () => {
  it("opens a new ticket for the customer and records the first status", async () => {
    const ticket = await createTicket(repo, sarah, validTicket);
    expect(ticket).toMatchObject({
      customerId: sarah.id,
      status: "new",
      serialNumber: null,
      technicianId: null,
    });
    expect(await repo.statusChanges.list(ticket.id)).toMatchObject([
      { actorId: sarah.id, from: null, to: "new" },
    ]);
  });

  it("answers 422 with a message per field", async () => {
    expect(
      await failure(
        createTicket(repo, sarah, {
          deviceType: "toaster",
          deviceModel: " ",
          serialNumber: "",
          problem: "short",
        }),
      ),
    ).toMatchObject({
      status: 422,
      fields: {
        deviceType: "Choose a device type",
        deviceModel: "Enter the device model",
        problem: "Describe the problem in at least 10 characters",
      },
    });
  });

  it("answers 403 for staff", async () => {
    expect(await failure(createTicket(repo, marco, validTicket))).toMatchObject(
      { status: 403 },
    );
  });
});

describe("listTickets", () => {
  it("returns only the tickets of the customer", async () => {
    const tickets = await listTickets(repo, sarah);
    expect(tickets.length).toBeGreaterThan(0);
    expect(tickets.every((t) => t.customerId === sarah.id)).toBe(true);
  });

  it("returns assigned tickets to a technician and all tickets to an admin", async () => {
    const assigned = await listTickets(repo, marco);
    expect(assigned.every((t) => t.technicianId === marco.id)).toBe(true);
    expect((await listTickets(repo, elena)).length).toBe(
      (await repo.tickets.list()).length,
    );
  });
});

describe("getTicketDetail", () => {
  it("hides tickets of other customers behind a 404", async () => {
    expect(
      await failure(getTicketDetail(repo, david, awaitingId)),
    ).toMatchObject({ status: 404 });
  });

  it("answers 404 for an unknown ticket", async () => {
    expect(await failure(getTicketDetail(repo, sarah, "TR-9"))).toMatchObject({
      status: 404,
    });
  });

  it("never returns internal notes to the customer", async () => {
    await repo.messages.add({
      ticketId: awaitingId,
      authorId: marco.id,
      kind: "internal_note",
      body: "Staff only",
    });
    const forCustomer = await getTicketDetail(repo, sarah, awaitingId);
    expect(forCustomer.messages.some((m) => m.kind === "internal_note")).toBe(
      false,
    );
    const forAdmin = await getTicketDetail(repo, elena, awaitingId);
    expect(forAdmin.messages.some((m) => m.kind === "internal_note")).toBe(
      true,
    );
  });

  it("includes the technician, the history and author names", async () => {
    const detail = await getTicketDetail(repo, sarah, awaitingId);
    expect(detail.technician?.role).toBe("technician");
    expect(detail.history.length).toBeGreaterThan(0);
    expect(detail.authors[sarah.id]).toBe("Sarah Mitchell");
  });
});

describe("sendMessage", () => {
  it("adds a customer message to their own ticket", async () => {
    const message = await sendMessage(repo, sarah, awaitingId, {
      body: "  Hello  ",
    });
    expect(message).toMatchObject({
      authorId: sarah.id,
      kind: "message",
      body: "Hello",
    });
  });

  it("rejects an empty message with a field error", async () => {
    expect(
      await failure(sendMessage(repo, sarah, awaitingId, { body: "  " })),
    ).toMatchObject({ status: 422, fields: { body: "Write a message" } });
  });

  it("answers 404 for a ticket of another customer", async () => {
    expect(
      await failure(sendMessage(repo, david, awaitingId, { body: "Hi" })),
    ).toMatchObject({ status: 404 });
  });
});

describe("estimate decisions", () => {
  it("approving moves the ticket to repair and records the change", async () => {
    const ticket = await approveTicketEstimate(repo, sarah, awaitingId);
    expect(ticket.status).toBe("in_repair");
    expect(ticket.estimate?.approval).toBe("approved");
    const history = await repo.statusChanges.list(awaitingId);
    expect(history.at(-1)).toMatchObject({
      actorId: sarah.id,
      from: "awaiting_approval",
      to: "in_repair",
    });
  });

  it("declining needs a reason", async () => {
    expect(
      await failure(
        declineTicketEstimate(repo, sarah, awaitingId, { reason: " " }),
      ),
    ).toMatchObject({
      status: 422,
      fields: { reason: "Tell us why you are declining" },
    });
  });

  it("declining stores the reason and ends the ticket", async () => {
    const ticket = await declineTicketEstimate(repo, sarah, awaitingId, {
      reason: "Too expensive",
    });
    expect(ticket.status).toBe("declined");
    expect(ticket.estimate).toMatchObject({
      approval: "declined",
      declineReason: "Too expensive",
    });
  });

  it("does not let staff decide for the customer", async () => {
    expect(
      await failure(approveTicketEstimate(repo, elena, awaitingId)),
    ).toMatchObject({ status: 403 });
  });

  it("rejects a second decision", async () => {
    await approveTicketEstimate(repo, sarah, awaitingId);
    const error = await failure(approveTicketEstimate(repo, sarah, awaitingId));
    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({ status: 422 });
  });

  it("answers 404 for another customer", async () => {
    expect(
      await failure(approveTicketEstimate(repo, david, awaitingId)),
    ).toMatchObject({ status: 404 });
  });
});
