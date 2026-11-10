import { beforeEach, describe, expect, it } from "vitest";

import { makeTicket } from "@/domain/ticket/test-helpers";
import type { User } from "@/domain/user";
import {
  createMemoryRepository,
  type SeedData,
} from "@/server/repository/memory-repository";
import type { Repository } from "@/server/repository/repository";

const NOW = new Date("2026-11-01T10:00:00.000Z");

const users: User[] = [
  { id: "u-1", name: "Sarah", email: "Sarah@Example.com", role: "customer" },
  { id: "u-2", name: "Marco", email: "marco@example.com", role: "technician" },
];

function makeSeed(): SeedData {
  return {
    users,
    tickets: [
      makeTicket({
        id: "TR-1001",
        customerId: "u-1",
        technicianId: "u-2",
        updatedAt: "2026-10-01T09:00:00.000Z",
      }),
      makeTicket({
        id: "TR-1002",
        customerId: "u-3",
        technicianId: null,
        updatedAt: "2026-10-05T09:00:00.000Z",
      }),
      makeTicket({
        id: "TR-1010",
        customerId: "u-1",
        technicianId: null,
        updatedAt: "2026-10-03T09:00:00.000Z",
      }),
    ],
    messages: [],
    statusChanges: [],
  };
}

let repo: Repository;

beforeEach(() => {
  repo = createMemoryRepository(makeSeed(), () => NOW);
});

describe("users", () => {
  it("gets a user by id", async () => {
    expect(await repo.users.get("u-2")).toMatchObject({ name: "Marco" });
    expect(await repo.users.get("nope")).toBeNull();
  });

  it("finds a user by email ignoring case and spaces", async () => {
    expect(await repo.users.findByEmail("  sarah@example.COM ")).toMatchObject({
      id: "u-1",
    });
    expect(await repo.users.findByEmail("nobody@example.com")).toBeNull();
  });

  it("lists all users", async () => {
    expect(await repo.users.list()).toHaveLength(2);
  });
});

describe("tickets", () => {
  it("gets a ticket by id", async () => {
    expect(await repo.tickets.get("TR-1001")).toMatchObject({ id: "TR-1001" });
    expect(await repo.tickets.get("TR-9999")).toBeNull();
  });

  it("lists the most recently updated first", async () => {
    const ids = (await repo.tickets.list()).map((t) => t.id);
    expect(ids).toEqual(["TR-1002", "TR-1010", "TR-1001"]);
  });

  it("filters by customer and by technician", async () => {
    const byCustomer = await repo.tickets.list({ customerId: "u-1" });
    expect(byCustomer.map((t) => t.id)).toEqual(["TR-1010", "TR-1001"]);

    const byTechnician = await repo.tickets.list({ technicianId: "u-2" });
    expect(byTechnician.map((t) => t.id)).toEqual(["TR-1001"]);
  });

  it("creates a new unassigned ticket with the next number", async () => {
    const ticket = await repo.tickets.create({
      customerId: "u-1",
      deviceType: "laptop",
      deviceModel: "Dell XPS 15",
      serialNumber: null,
      problem: "Will not boot",
    });

    expect(ticket).toMatchObject({
      id: "TR-1011",
      status: "new",
      technicianId: null,
      priority: "normal",
      estimate: null,
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    });
    expect(await repo.tickets.get("TR-1011")).toEqual(ticket);
  });

  it("updates a ticket and refreshes updatedAt", async () => {
    const updated = await repo.tickets.update("TR-1001", {
      status: "diagnosing",
      priority: "high",
    });

    expect(updated).toMatchObject({
      status: "diagnosing",
      priority: "high",
      updatedAt: NOW.toISOString(),
    });
    expect(await repo.tickets.get("TR-1001")).toEqual(updated);
  });

  it("answers 404 when updating a ticket that does not exist", async () => {
    await expect(
      repo.tickets.update("TR-9999", { status: "diagnosing" }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("does not let callers change stored data through returned objects", async () => {
    const ticket = await repo.tickets.get("TR-1001");
    ticket!.problem = "Changed outside";

    expect((await repo.tickets.get("TR-1001"))!.problem).toBe("Cracked screen");
  });

  it("does not change the seed it was given", async () => {
    const seed = makeSeed();
    const local = createMemoryRepository(seed, () => NOW);
    await local.tickets.update("TR-1001", { status: "diagnosing" });

    expect(seed.tickets[0].status).toBe("new");
  });
});

describe("messages", () => {
  it("stores messages and internal notes in order", async () => {
    await repo.messages.add({
      ticketId: "TR-1001",
      authorId: "u-1",
      kind: "message",
      body: "Any news?",
    });
    await repo.messages.add({
      ticketId: "TR-1001",
      authorId: "u-2",
      kind: "internal_note",
      body: "Waiting for the part.",
    });

    const list = await repo.messages.list("TR-1001");
    expect(list.map((m) => m.kind)).toEqual(["message", "internal_note"]);
    expect(list[0]).toMatchObject({ createdAt: NOW.toISOString() });
    expect(await repo.messages.list("TR-1002")).toEqual([]);
  });

  it("answers 404 when the ticket does not exist", async () => {
    await expect(
      repo.messages.add({
        ticketId: "TR-9999",
        authorId: "u-1",
        kind: "message",
        body: "Hello",
      }),
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe("statusChanges", () => {
  it("records the history of a ticket", async () => {
    await repo.statusChanges.add({
      ticketId: "TR-1001",
      actorId: "u-2",
      from: "new",
      to: "diagnosing",
    });

    expect(await repo.statusChanges.list("TR-1001")).toMatchObject([
      { from: "new", to: "diagnosing", createdAt: NOW.toISOString() },
    ]);
    expect(await repo.statusChanges.list("TR-1002")).toEqual([]);
  });

  it("answers 404 when the ticket does not exist", async () => {
    await expect(
      repo.statusChanges.add({
        ticketId: "TR-9999",
        actorId: "u-2",
        from: null,
        to: "new",
      }),
    ).rejects.toMatchObject({ status: 404 });
  });
});
