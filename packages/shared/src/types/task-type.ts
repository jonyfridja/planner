import type { Role } from "./role.js";

export interface FieldDefinition {
  name: string;
  label: string;
  type: "string" | "number" | "boolean";
  required: boolean;
}

export interface StatusSummary {
  value: number;
  label: string;
  fields: FieldDefinition[];
  requiredRole: Role;
}

export interface TaskTypeSummary {
  type: string;
  label: string;
  statuses: StatusSummary[];
  finalStatus: number;
}
