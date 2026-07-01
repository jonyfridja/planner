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
}

export interface TaskTypeSummary {
  type: string;
  label: string;
  statuses: StatusSummary[];
  finalStatus: number;
}
