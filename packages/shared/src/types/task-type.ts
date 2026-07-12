import type { Role } from "./role.js";
import type { TaskFieldType } from "../consts/index.js";

export interface FieldDefinition {
  name: string;
  label: string;
  type: (typeof TaskFieldType)[keyof typeof TaskFieldType];
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
