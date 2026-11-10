import type { Role } from "@/domain/actor";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};
