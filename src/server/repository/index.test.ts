import { describe, expect, it, vi } from "vitest";

// The real package throws outside the server build, which is its whole purpose.
vi.mock("server-only", () => ({}));

describe("getRepository", () => {
  it("returns one shared repository, even after the module is reloaded", async () => {
    const first = (await import("@/server/repository")).getRepository();
    await first.tickets.update("TR-1052", { priority: "low" });

    vi.resetModules();
    const second = (await import("@/server/repository")).getRepository();

    expect(second).toBe(first);
    expect((await second.tickets.get("TR-1052"))?.priority).toBe("low");
  });
});
