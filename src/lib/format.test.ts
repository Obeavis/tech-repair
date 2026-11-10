import { describe, expect, it } from "vitest";

import { formatDate, formatDateTime, formatMoney } from "@/lib/format";

describe("format", () => {
  it("formats cents as dollars", () => {
    expect(formatMoney(28900)).toBe("$289.00");
    expect(formatMoney(1250)).toBe("$12.50");
  });

  it("formats dates in UTC", () => {
    expect(formatDate("2026-10-22T23:30:00.000Z")).toBe("Oct 22, 2026");
    expect(formatDateTime("2026-10-22T10:20:00.000Z")).toBe(
      "Oct 22, 2026, 10:20 AM",
    );
  });
});
