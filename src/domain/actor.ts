export const ROLES = ["customer", "technician", "admin"] as const;

export type Role = (typeof ROLES)[number];

export type Actor = { id: string; role: Role };

export const isStaff = (actor: Actor) => actor.role !== "customer";
