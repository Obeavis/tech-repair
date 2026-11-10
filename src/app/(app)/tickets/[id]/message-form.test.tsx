import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { FormState } from "@/app/(app)/tickets/actions";
import { MessageForm } from "@/app/(app)/tickets/[id]/message-form";

describe("MessageForm", () => {
  it("sends the typed message", async () => {
    const action = vi.fn(async () => ({}) as FormState);
    const user = userEvent.setup();
    render(<MessageForm action={action} />);
    await user.type(screen.getByLabelText("Message to the shop"), "Hello");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    const call = action.mock.calls[0] as unknown as [FormState, FormData];
    expect(call[1].get("body")).toBe("Hello");
  });

  it("shows the field error", async () => {
    const action = vi.fn(
      async () =>
        ({
          error: "Check the highlighted fields",
          fields: { body: "Write a message" },
          values: { body: "" },
        }) as FormState,
    );
    const user = userEvent.setup();
    render(<MessageForm action={action} />);
    await user.click(screen.getByRole("button", { name: "Send message" }));
    const field = await screen.findByLabelText("Message to the shop");
    expect(field).toHaveAccessibleDescription("Write a message");
  });
});
