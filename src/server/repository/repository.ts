import type { Message, StatusChange, Ticket } from "@/domain/ticket/types";
import type { User } from "@/domain/user";

export type TicketFilter = { customerId?: string; technicianId?: string };

export type NewTicket = Pick<
  Ticket,
  "customerId" | "deviceType" | "deviceModel" | "serialNumber" | "problem"
>;

export type TicketPatch = Partial<
  Pick<
    Ticket,
    | "technicianId"
    | "status"
    | "priority"
    | "diagnosis"
    | "estimate"
    | "expectedCompletionAt"
  >
>;

export type NewMessage = Pick<
  Message,
  "ticketId" | "authorId" | "kind" | "body"
>;

export type NewStatusChange = Pick<
  StatusChange,
  "ticketId" | "actorId" | "from" | "to"
>;

// Plain storage: who may see or change what is decided by the services.
// Lists come back oldest first, except tickets (most recently updated first).
export interface Repository {
  users: {
    get(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    list(): Promise<User[]>;
  };
  tickets: {
    get(id: string): Promise<Ticket | null>;
    list(filter?: TicketFilter): Promise<Ticket[]>;
    create(input: NewTicket): Promise<Ticket>;
    update(id: string, patch: TicketPatch): Promise<Ticket>;
  };
  messages: {
    list(ticketId: string): Promise<Message[]>;
    add(input: NewMessage): Promise<Message>;
  };
  statusChanges: {
    list(ticketId: string): Promise<StatusChange[]>;
    add(input: NewStatusChange): Promise<StatusChange>;
  };
}
