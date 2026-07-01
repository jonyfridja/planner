import type { ClassConstructor } from "class-transformer";
import type { FieldDefinition } from "@planner/shared";

export interface StatusDefinition {
  value: number;
  label: string;
  dataSchema?: ClassConstructor<object>;
  fields: FieldDefinition[];
}

export interface DataValidationResult {
  valid: boolean;
  errors?: string[];
  data?: Record<string, unknown>;
}

export interface TaskTypeDefinition {
  readonly type: string;
  readonly label: string;
  getStatuses(): StatusDefinition[];
  getFinalStatus(): number;
  getStatus(value: number): StatusDefinition | undefined;
  validateData(status: number, data: unknown): Promise<DataValidationResult>;
}
