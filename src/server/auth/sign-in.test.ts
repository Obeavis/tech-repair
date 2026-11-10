import { describe, expect, it } from "vitest";

import { signIn } from "@/server/auth/sign-in";
import { createMemoryRepository } from "@/server/repository/memory-repository";
import { seedData } from "@/server/repository/seed";

const repo = createMemoryRepository(seedData);

async function failure(input: unknown) {
  try {
    await signIn(repo, input);
  } catch (error) {
    return error;
  }
}

describe("signIn", () => {
  it("returns the user for a known email and any password", async () => {
    const user = await signIn(repo, {
      email: "sarah.mitchell@example.com",
      password: "anything",
    });
    expect(user).toMatchObject({ id: "usr-sarah", role: "customer" });
  });

  it("ignores case and spaces around the email", async () => {
    const user = await signIn(repo, {
      email: "  Marco.Diaz@Example.com ",
      password: "x",
    });
    expect(user.id).toBe("usr-marco");
  });

  it("answers 401 for an unknown email", async () => {
    expect(
      await failure({ email: "nobody@example.com", password: "x" }),
    ).toMatchObject({ status: 401, message: "Invalid email or password" });
  });

  it("answers 422 with a message per field for invalid input", async () => {
    expect(
      await failure({ email: "not-an-email", password: "" }),
    ).toMatchObject({
      status: 422,
      fields: {
        email: "Enter a valid email address",
        password: "Enter your password",
      },
    });
  });
});
