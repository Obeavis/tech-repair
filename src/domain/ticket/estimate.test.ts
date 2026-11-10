import { describe, expect, it } from "vitest";

import {
  approveEstimate,
  declineEstimate,
  reviseEstimate,
} from "@/domain/ticket/estimate";
import { makeTicket, pendingEstimate } from "@/domain/ticket/test-helpers";
import type { Estimate } from "@/domain/ticket/types";

const approved: Estimate = { ...pendingEstimate, approval: "approved" };

describe("reviseEstimate", () => {
  it("creates a pending estimate while diagnosing", () => {
    const result = reviseEstimate(makeTicket({ status: "diagnosing" }), 15000);
    expect(result).toEqual({
      estimate: {
        amountCents: 15000,
        approval: "pending",
        declineReason: null,
      },
      status: "diagnosing",
    });
  });

  it("sends a ticket in repair back to approval when the amount changes", () => {
    const ticket = makeTicket({ status: "in_repair", estimate: approved });
    const result = reviseEstimate(ticket, 31000);
    expect(result.estimate).toMatchObject({
      amountCents: 31000,
      approval: "pending",
    });
    expect(result.status).toBe("awaiting_approval");
  });

  it("keeps an approved estimate when the amount is unchanged", () => {
    const ticket = makeTicket({ status: "in_repair", estimate: approved });
    expect(reviseEstimate(ticket, approved.amountCents)).toEqual({
      estimate: approved,
      status: "in_repair",
    });
  });

  it("replaces a pending estimate without changing the status", () => {
    const ticket = makeTicket({
      status: "awaiting_approval",
      estimate: pendingEstimate,
    });
    const result = reviseEstimate(ticket, 20000);
    expect(result.estimate.amountCents).toBe(20000);
    expect(result.status).toBe("awaiting_approval");
  });

  it.each([0, -5, 12.5, Number.NaN])("rejects the amount %s", (amount) => {
    expect(() =>
      reviseEstimate(makeTicket({ status: "diagnosing" }), amount),
    ).toThrow(expect.objectContaining({ status: 422 }));
  });

  it.each(["new", "awaiting_parts", "ready_for_pickup", "completed"] as const)(
    "rejects changes while the ticket is %s",
    (status) => {
      expect(() => reviseEstimate(makeTicket({ status }), 10000)).toThrow(
        expect.objectContaining({ status: 422 }),
      );
    },
  );
});

describe("approveEstimate", () => {
  it("approves a pending estimate", () => {
    expect(approveEstimate(pendingEstimate).approval).toBe("approved");
  });

  it.each([null, approved])("rejects when nothing is pending", (estimate) => {
    expect(() => approveEstimate(estimate)).toThrow(
      expect.objectContaining({ status: 422 }),
    );
  });
});

describe("declineEstimate", () => {
  it("records the trimmed reason", () => {
    expect(declineEstimate(pendingEstimate, "  Too expensive ")).toMatchObject({
      approval: "declined",
      declineReason: "Too expensive",
    });
  });

  it.each(["", "   "])("requires a reason (%j)", (reason) => {
    expect(() => declineEstimate(pendingEstimate, reason)).toThrow(
      expect.objectContaining({ status: 422 }),
    );
  });

  it("rejects when nothing is pending", () => {
    expect(() => declineEstimate(approved, "No")).toThrow(
      expect.objectContaining({ status: 422 }),
    );
  });
});
