export const ROLES = [
  "requester",
  "buyer",
  "finance",
  "analyst",
  "developer",
  "publisher",
] as const;

export type Role = (typeof ROLES)[number];
