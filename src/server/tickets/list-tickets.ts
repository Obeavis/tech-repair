import type { Actor } from "@/domain/actor";
import type { Ticket } from "@/domain/ticket/types";
import type { Repository } from "@/server/repository/repository";

export async function listTickets(
  repo: Repository,
  actor: Actor,
): Promise<Ticket[]> {
  switch (actor.role) {
    case "customer":
      return repo.tickets.list({ customerId: actor.id });
    case "technician":
      return repo.tickets.list({ technicianId: actor.id });
    case "admin":
      return repo.tickets.list();
  }
}
