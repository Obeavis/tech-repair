import { z } from "zod";

import type { User } from "@/domain/user";
import { AppError } from "@/lib/app-error";
import { parseInput } from "@/lib/parse-input";
import type { Repository } from "@/server/repository/repository";

export const signInSchema = z.object({
  email: z.string().trim().pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Enter your password"),
});

// Mock: any non-empty password is accepted. Real authentication replaces this function.
export async function signIn(repo: Repository, input: unknown): Promise<User> {
  const { email } = parseInput(signInSchema, input);
  const user = await repo.users.findByEmail(email);
  if (!user) throw new AppError(401, "Invalid email or password");
  return user;
}
