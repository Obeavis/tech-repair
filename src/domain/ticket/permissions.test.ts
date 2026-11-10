import { describe, expect, it } from "vitest";

import {
  assertCanAssignTechnician,
  assertCanManage,
  assertCanView,
  canSeeInternalNotes,
  canView,
} from "@/domain/ticket/permissions";
import {
  admin,
  customer,
  makeTicket,
  otherCustomer,
  otherTechnician,
  technician,
} from "@/domain/ticket/test-helpers";

const ticket = makeTicket();

describe("canView", () => {
  it("lets a customer see only their own tickets", () => {
    expect(canView(customer, ticket)).toBe(true);
    expect(canView(otherCustomer, ticket)).toBe(false);
  });

  it("lets a technician see only tickets assigned to them", () => {
    expect(canView(technician, ticket)).toBe(true);
    expect(canView(otherTechnician, ticket)).toBe(false);
    expect(canView(technician, makeTicket({ technicianId: null }))).toBe(false);
  });

  it("lets an admin see everything", () => {
    expect(canView(admin, makeTicket({ technicianId: null }))).toBe(true);
  });
});

describe("assertCanView", () => {
  it("answers 404 so other customers' tickets are not revealed", () => {
    expect(() => assertCanView(otherCustomer, ticket)).toThrow(
      expect.objectContaining({ status: 404 }),
    );
  });
});

describe("canSeeInternalNotes", () => {
  it("never shows internal notes to customers", () => {
    expect(canSeeInternalNotes(customer, ticket)).toBe(false);
  });

  it("shows them to the assigned technician and admins only", () => {
    expect(canSeeInternalNotes(technician, ticket)).toBe(true);
    expect(canSeeInternalNotes(otherTechnician, ticket)).toBe(false);
    expect(canSeeInternalNotes(admin, ticket)).toBe(true);
  });
});

describe("assertCanManage", () => {
  it("rejects customers with 403", () => {
    expect(() => assertCanManage(customer, ticket)).toThrow(
      expect.objectContaining({ status: 403 }),
    );
  });

  it("rejects a technician who is not assigned with 404", () => {
    expect(() => assertCanManage(otherTechnician, ticket)).toThrow(
      expect.objectContaining({ status: 404 }),
    );
  });

  it("allows the assigned technician and admins", () => {
    expect(() => assertCanManage(technician, ticket)).not.toThrow();
    expect(() => assertCanManage(admin, ticket)).not.toThrow();
  });
});

describe("assertCanAssignTechnician", () => {
  it("allows an admin to assign a technician", () => {
    expect(() => assertCanAssignTechnician(admin, technician)).not.toThrow();
  });

  it("rejects non-admins with 403", () => {
    expect(() => assertCanAssignTechnician(technician, technician)).toThrow(
      expect.objectContaining({ status: 403 }),
    );
  });

  it("rejects an assignee who is not a technician with 422", () => {
    expect(() => assertCanAssignTechnician(admin, customer)).toThrow(
      expect.objectContaining({ status: 422 }),
    );
  });
});
