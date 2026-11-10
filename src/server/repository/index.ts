import "server-only";

import { createMemoryRepository } from "@/server/repository/memory-repository";
import type { Repository } from "@/server/repository/repository";
import { seedData } from "@/server/repository/seed";

// Kept on globalThis so dev hot reloads do not reset the data.
const globalStore = globalThis as typeof globalThis & {
  techRepairRepository?: Repository;
};

export function getRepository(): Repository {
  globalStore.techRepairRepository ??= createMemoryRepository(seedData);
  return globalStore.techRepairRepository;
}
