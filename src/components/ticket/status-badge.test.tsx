import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "@/components/ticket/status-badge";

describe("StatusBadge", () => {
  it("shows the status as text, not only as a color", () => {
    render(<StatusBadge status="awaiting_approval" />);
    expect(screen.getByText("Awaiting approval")).toBeInTheDocument();
  });
});
