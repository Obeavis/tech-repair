export const TICKET_STATUSES = [
  "new",
  "diagnosing",
  "awaiting_approval",
  "awaiting_parts",
  "in_repair",
  "ready_for_pickup",
  "completed",
  "declined",
  "cancelled",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export type EstimateApproval = "pending" | "approved" | "declined";

export type Estimate = {
  amountCents: number;
  approval: EstimateApproval;
  declineReason: string | null;
};

export type Ticket = {
  id: string;
  customerId: string;
  technicianId: string | null;
  status: TicketStatus;
  estimate: Estimate | null;
};
