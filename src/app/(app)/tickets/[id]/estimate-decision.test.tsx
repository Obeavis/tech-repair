import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { FormState } from "@/app/(app)/tickets/actions";
import { EstimateDecision } from "@/app/(app)/tickets/[id]/estimate-decision";

function setup(declineResult: FormState = {}) {
  const approve = vi.fn(async () => ({}) as FormState);
  const decline = vi.fn(async () => declineResult);
  render(<EstimateDecision approve={approve} decline={decline} />);
  return { approve, decline, user: userEvent.setup() };
}

describe("EstimateDecision", () => {
  it("approves without asking for anything", async () => {
    const { approve, user } = setup();
    await user.click(screen.getByRole("button", { name: "Approve estimate" }));
    expect(approve).toHaveBeenCalledTimes(1);
  });

  it("sends the reason when declining", async () => {
    const { decline, user } = setup();
    await user.type(screen.getByLabelText("Reason for declining"), "Too much");
    await user.click(screen.getByRole("button", { name: "Decline estimate" }));
    const call = decline.mock.calls[0] as unknown as [FormState, FormData];
    expect(call[1].get("reason")).toBe("Too much");
  });

  it("explains a missing reason next to the field", async () => {
    const { user } = setup({
      error: "Check the highlighted fields",
      fields: { reason: "Tell us why you are declining" },
      values: { reason: "" },
    });
    await user.click(screen.getByRole("button", { name: "Decline estimate" }));
    const reason = await screen.findByLabelText("Reason for declining");
    expect(reason).toBeInvalid();
    expect(reason).toHaveAccessibleDescription("Tell us why you are declining");
  });
});
