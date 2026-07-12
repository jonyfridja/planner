export const ROLES = [
  "requester",
  "buyer",
  "finance",
  "analyst",
  "developer",
  "publisher",
  "hr",
] as const;

export type Role = (typeof ROLES)[number];
