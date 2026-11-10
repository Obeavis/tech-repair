import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { SignInState } from "@/app/login/actions";
import { LoginForm } from "@/app/login/login-form";

function setup(result: SignInState) {
  const action = vi.fn(async () => result);
  render(<LoginForm action={action} />);
  return { action, user: userEvent.setup() };
}

describe("LoginForm", () => {
  it("sends the typed email and password", async () => {
    const { action, user } = setup({});
    await user.type(screen.getByLabelText("Email"), "sarah@example.com");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    const formData = action.mock.calls[0] as unknown as [SignInState, FormData];
    expect(formData[1].get("email")).toBe("sarah@example.com");
    expect(formData[1].get("password")).toBe("secret");
  });

  it("shows a message next to each invalid field and keeps the email", async () => {
    const { user } = setup({
      error: "Check the highlighted fields",
      fields: {
        email: "Enter a valid email address",
        password: "Enter your password",
      },
      email: "oops",
    });
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    const email = await screen.findByLabelText("Email");
    expect(email).toHaveValue("oops");
    expect(email).toBeInvalid();
    expect(email).toHaveAccessibleDescription("Enter a valid email address");
    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription(
      "Enter your password",
    );
  });

  it("announces an error that belongs to no field", async () => {
    const { user } = setup({ error: "Invalid email or password" });
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password",
    );
  });
});
