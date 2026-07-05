import type { Role } from "./role.js";

export interface User {
  id: string;
  email: string;
  name: string;
  roles: Role[];
}
