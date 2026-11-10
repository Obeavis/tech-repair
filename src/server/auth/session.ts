import "server-only";

import { cookies } from "next/headers";

const COOKIE_NAME = "session";
const WEEK_IN_SECONDS = 60 * 60 * 24 * 7;

// Mock session: the cookie holds the bare user id and is not signed, so anyone can forge it.
export async function createSession(userId: string) {
  (await cookies()).set(COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: WEEK_IN_SECONDS,
    path: "/",
  });
}

export async function getSessionUserId() {
  return (await cookies()).get(COOKIE_NAME)?.value ?? null;
}

export async function destroySession() {
  (await cookies()).delete(COOKIE_NAME);
}
