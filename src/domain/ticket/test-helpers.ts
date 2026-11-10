import type { Actor } from "@/domain/actor";
import type { Estimate, Ticket } from "@/domain/ticket/types";

export const customer: Actor = { id: "cus-1", role: "customer" };
export const otherCustomer: Actor = { id: "cus-2", role: "customer" };
export const technician: Actor = { id: "tech-1", role: "technician" };
export const otherTechnician: Actor = { id: "tech-2", role: "technician" };
export const admin: Actor = { id: "adm-1", role: "admin" };

export const pendingEstimate: Estimate = {
  amountCents: 28900,
  approval: "pending",
  declineReason: null,
};

export function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: "TR-1001",
    customerId: customer.id,
    technicianId: technician.id,
    status: "new",
    priority: "normal",
    deviceType: "phone",
    deviceModel: "iPhone 13",
    serialNumber: null,
    problem: "Cracked screen",
    diagnosis: null,
    estimate: null,
    expectedCompletionAt: null,
    createdAt: "2026-10-01T09:00:00.000Z",
    updatedAt: "2026-10-01T09:00:00.000Z",
    ...overrides,
  };
}
