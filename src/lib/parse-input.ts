import type { z } from "zod";

import { AppError, type FieldErrors } from "@/lib/app-error";

export function parseInput<T extends z.ZodType>(
  schema: T,
  input: unknown,
): z.output<T> {
  const result = schema.safeParse(input);
  if (result.success) return result.data;

  const fields: FieldErrors = {};
  for (const issue of result.error.issues) {
    const name = issue.path.join(".");
    if (!(name in fields)) fields[name] = issue.message;
  }
  throw new AppError(422, "Check the highlighted fields", fields);
}
