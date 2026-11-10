import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("applies the status tone tokens", () => {
    render(<Badge variant="warning">Awaiting approval</Badge>);
    expect(screen.getByText("Awaiting approval")).toHaveClass(
      "bg-status-warning",
      "text-status-warning-foreground",
    );
  });
});
