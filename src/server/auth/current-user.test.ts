import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMemoryRepository } from "@/server/repository/memory-repository";
import { seedData } from "@/server/repository/seed";

const getSessionUserId = vi.fn();
const redirect = vi.fn((path: string) => {
  throw new Error(`redirect:${path}`);
});

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => redirect(path),
}));
vi.mock("@/server/auth/session", () => ({
  getSessionUserId: () => getSessionUserId(),
}));
vi.mock("@/server/repository", () => ({
  getRepository: () => createMemoryRepository(seedData),
}));

import { getCurrentUser, requireUser } from "@/server/auth/current-user";

beforeEach(() => vi.clearAllMocks());

describe("getCurrentUser", () => {
  it("returns the user the session points to", async () => {
    getSessionUserId.mockResolvedValue("usr-marco");
    expect(await getCurrentUser()).toMatchObject({
      id: "usr-marco",
      role: "technician",
    });
  });

  it("returns null without a session", async () => {
    getSessionUserId.mockResolvedValue(null);
    expect(await getCurrentUser()).toBeNull();
  });

  it("returns null when the session points to a user that no longer exists", async () => {
    getSessionUserId.mockResolvedValue("usr-ghost");
    expect(await getCurrentUser()).toBeNull();
  });
});

describe("requireUser", () => {
  it("returns the signed-in user", async () => {
    getSessionUserId.mockResolvedValue("usr-elena");
    expect(await requireUser()).toMatchObject({ role: "admin" });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("sends visitors without a session to the login page", async () => {
    getSessionUserId.mockResolvedValue(null);
    await expect(requireUser()).rejects.toThrow("redirect:/login");
  });
});
