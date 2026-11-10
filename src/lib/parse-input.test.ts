import { describe, expect, it } from "vitest";
import { z } from "zod";

import { parseInput } from "@/lib/parse-input";

const schema = z.object({
  email: z.string().min(1, "Enter your email"),
  age: z.number("Enter your age"),
});

function failure(input: unknown) {
  try {
    parseInput(schema, input);
  } catch (error) {
    return error;
  }
}

describe("parseInput", () => {
  it("returns the parsed data when it is valid", () => {
    expect(parseInput(schema, { email: "a@b.co", age: 30 })).toEqual({
      email: "a@b.co",
      age: 30,
    });
  });

  it("throws a 422 with one message per field", () => {
    expect(failure({ email: "", age: "x" })).toMatchObject({
      status: 422,
      fields: { email: "Enter your email", age: "Enter your age" },
    });
  });

  it("keeps the first message when a field has several problems", () => {
    const strict = z.object({
      name: z.string().min(3, "Too short").regex(/^\d+$/, "Digits only"),
    });
    expect(() => parseInput(strict, { name: "a" })).toThrow(
      expect.objectContaining({ fields: { name: "Too short" } }),
    );
  });
});
