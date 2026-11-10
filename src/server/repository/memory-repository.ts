import type { Message, StatusChange, Ticket } from "@/domain/ticket/types";
import type { User } from "@/domain/user";
import { AppError } from "@/lib/app-error";
import type { Repository } from "@/server/repository/repository";

export type SeedData = {
  users: User[];
  tickets: Ticket[];
  messages: Message[];
  statusChanges: StatusChange[];
};

const ticketNumber = (id: string) => Number(id.replace("TR-", ""));

// Everything is copied on the way in and out, so callers cannot change stored data by accident.
export function createMemoryRepository(
  seed: SeedData,
  now: () => Date = () => new Date(),
): Repository {
  const data = structuredClone(seed);
  let lastTicketNumber = Math.max(
    0,
    ...data.tickets.map((t) => ticketNumber(t.id)),
  );

  const findTicket = (id: string) => {
    const ticket = data.tickets.find((t) => t.id === id);
    if (!ticket) throw new AppError(404, "Ticket not found");
    return ticket;
  };

  return {
    users: {
      async get(id) {
        return structuredClone(data.users.find((u) => u.id === id) ?? null);
      },
      async findByEmail(email) {
        const wanted = email.trim().toLowerCase();
        return structuredClone(
          data.users.find((u) => u.email.toLowerCase() === wanted) ?? null,
        );
      },
      async list() {
        return structuredClone(data.users);
      },
    },

    tickets: {
      async get(id) {
        return structuredClone(data.tickets.find((t) => t.id === id) ?? null);
      },
      async list(filter = {}) {
        const matches = data.tickets.filter(
          (t) =>
            (filter.customerId === undefined ||
              t.customerId === filter.customerId) &&
            (filter.technicianId === undefined ||
              t.technicianId === filter.technicianId),
        );
        return structuredClone(
          matches.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
        );
      },
      async create(input) {
        const timestamp = now().toISOString();
        const ticket: Ticket = {
          ...structuredClone(input),
          id: `TR-${++lastTicketNumber}`,
          technicianId: null,
          status: "new",
          priority: "normal",
          diagnosis: null,
          estimate: null,
          expectedCompletionAt: null,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        data.tickets.push(ticket);
        return structuredClone(ticket);
      },
      async update(id, patch) {
        const ticket = findTicket(id);
        Object.assign(ticket, structuredClone(patch), {
          updatedAt: now().toISOString(),
        });
        return structuredClone(ticket);
      },
    },

    messages: {
      async list(ticketId) {
        return structuredClone(
          data.messages.filter((m) => m.ticketId === ticketId),
        );
      },
      async add(input) {
        findTicket(input.ticketId);
        const message: Message = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: now().toISOString(),
        };
        data.messages.push(message);
        return structuredClone(message);
      },
    },

    statusChanges: {
      async list(ticketId) {
        return structuredClone(
          data.statusChanges.filter((c) => c.ticketId === ticketId),
        );
      },
      async add(input) {
        findTicket(input.ticketId);
        const change: StatusChange = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: now().toISOString(),
        };
        data.statusChanges.push(change);
        return structuredClone(change);
      },
    },
  };
}
