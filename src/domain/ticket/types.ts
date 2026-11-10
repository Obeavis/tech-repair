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

export const DEVICE_TYPES = [
  "phone",
  "laptop",
  "tablet",
  "desktop",
  "game_console",
  "headphones",
  "other",
] as const;

export type DeviceType = (typeof DEVICE_TYPES)[number];

export const PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export type Priority = (typeof PRIORITIES)[number];

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
  priority: Priority;
  deviceType: DeviceType;
  deviceModel: string;
  serialNumber: string | null;
  problem: string;
  diagnosis: string | null;
  estimate: Estimate | null;
  expectedCompletionAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  ticketId: string;
  authorId: string;
  kind: "message" | "internal_note";
  body: string;
  createdAt: string;
};

export type StatusChange = {
  id: string;
  ticketId: string;
  actorId: string;
  from: TicketStatus | null;
  to: TicketStatus;
  createdAt: string;
};
