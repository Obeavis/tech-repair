import { beforeEach, describe, expect, it, vi } from "vitest";

const store = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => store }));

import {
  createSession,
  destroySession,
  getSessionUserId,
} from "@/server/auth/session";

beforeEach(() => vi.clearAllMocks());

describe("session", () => {
  it("stores the user id in an http-only cookie", async () => {
    await createSession("usr-sarah");

    expect(store.set).toHaveBeenCalledWith(
      "session",
      "usr-sarah",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      }),
    );
  });

  it("reads the user id back, or null without a cookie", async () => {
    store.get.mockReturnValueOnce({ name: "session", value: "usr-sarah" });
    expect(await getSessionUserId()).toBe("usr-sarah");

    store.get.mockReturnValueOnce(undefined);
    expect(await getSessionUserId()).toBeNull();
  });

  it("deletes the cookie on sign out", async () => {
    await destroySession();
    expect(store.delete).toHaveBeenCalledWith("session");
  });
});
