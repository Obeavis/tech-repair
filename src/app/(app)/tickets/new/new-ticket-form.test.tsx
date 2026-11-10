import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { FormState } from "@/app/(app)/tickets/actions";
import { NewTicketForm } from "@/app/(app)/tickets/new/new-ticket-form";

function setup(result: FormState) {
  const action = vi.fn(async () => result);
  render(<NewTicketForm action={action} />);
  return { action, user: userEvent.setup() };
}

describe("NewTicketForm", () => {
  it("sends what was typed and chosen", async () => {
    const { action, user } = setup({});
    await user.selectOptions(screen.getByLabelText("Device type"), "laptop");
    await user.type(screen.getByLabelText("Brand and model"), "ThinkPad X1");
    await user.type(screen.getByLabelText("What is wrong?"), "Does not boot");
    await user.click(screen.getByRole("button", { name: "Send request" }));

    const call = action.mock.calls[0] as unknown as [FormState, FormData];
    expect(call[1].get("deviceType")).toBe("laptop");
    expect(call[1].get("deviceModel")).toBe("ThinkPad X1");
    expect(call[1].get("problem")).toBe("Does not boot");
  });

  it("shows a message next to each invalid field and keeps what was typed", async () => {
    const { user } = setup({
      error: "Check the highlighted fields",
      fields: {
        deviceType: "Choose a device type",
        problem: "Describe the problem in at least 10 characters",
      },
      values: { deviceModel: "Pixel 8", problem: "short" },
    });
    await user.click(screen.getByRole("button", { name: "Send request" }));

    const problem = await screen.findByLabelText("What is wrong?");
    expect(problem).toBeInvalid();
    expect(problem).toHaveAccessibleDescription(
      "Describe the problem in at least 10 characters",
    );
    expect(problem).toHaveValue("short");
    expect(screen.getByLabelText("Brand and model")).toHaveValue("Pixel 8");
    expect(screen.getByLabelText("Device type")).toBeInvalid();
  });
});
