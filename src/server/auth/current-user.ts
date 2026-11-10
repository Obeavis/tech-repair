import "server-only";

import { redirect } from "next/navigation";

import type { User } from "@/domain/user";
import { getSessionUserId } from "@/server/auth/session";
import { getRepository } from "@/server/repository";

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getSessionUserId();
  return userId ? getRepository().users.get(userId) : null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
