export const ROLES = ["requester", "buyer", "finance"] as const;

export type Role = (typeof ROLES)[number];
