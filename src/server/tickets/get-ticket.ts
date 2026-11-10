import type { Actor } from "@/domain/actor";
import {
  assertCanView,
  canSeeInternalNotes,
} from "@/domain/ticket/permissions";
import type { Message, StatusChange, Ticket } from "@/domain/ticket/types";
import type { User } from "@/domain/user";
import { AppError } from "@/lib/app-error";
import type { Repository } from "@/server/repository/repository";

export type TicketDetail = {
  ticket: Ticket;
  technician: User | null;
  messages: Message[];
  history: StatusChange[];
  authors: Record<string, string>;
};

export async function getTicketDetail(
  repo: Repository,
  actor: Actor,
  id: string,
): Promise<TicketDetail> {
  const ticket = await repo.tickets.get(id);
  if (!ticket) throw new AppError(404, "Ticket not found");
  assertCanView(actor, ticket);

  const [allMessages, history, users] = await Promise.all([
    repo.messages.list(id),
    repo.statusChanges.list(id),
    repo.users.list(),
  ]);
  const showNotes = canSeeInternalNotes(actor, ticket);
  const messages = allMessages.filter(
    (m) => showNotes || m.kind !== "internal_note",
  );

  return {
    ticket,
    technician: users.find((u) => u.id === ticket.technicianId) ?? null,
    messages,
    history,
    authors: Object.fromEntries(users.map((u) => [u.id, u.name])),
  };
}
