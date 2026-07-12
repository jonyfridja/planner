import { Injectable } from "@nestjs/common";
import { plainToInstance, instanceToPlain } from "class-transformer";
import { validate } from "class-validator";
import { TaskFieldType } from "@planner/shared";
import type {
  DataValidationResult,
  StatusDefinition,
  TaskTypeDefinition,
} from "../task-type-definition.interface";
import { Step1DataDto } from "./dto/step1.dto";

const STATUSES: StatusDefinition[] = [
  { value: 1, label: "Created", fields: [], requiredRole: "requester" },
  {
    value: 2,
    label: "Budget",
    dataSchema: Step1DataDto,
    fields: [
      {
        name: "budget",
        label: "Budget",
        type: TaskFieldType.NUMBER,
        required: true,
      },
      {
        name: "dueDate",
        label: "Due Date",
        type: TaskFieldType.DATE,
        required: true,
      },
    ],
    requiredRole: "hr",
  },
];

@Injectable()
export class HRTaskTypeDefinition implements TaskTypeDefinition {
  readonly type = "hr";
  readonly label = "HR Task";

  getStatuses(): StatusDefinition[] {
    return STATUSES;
  }

  getFinalStatus(): number {
    return 2;
  }

  getStatus(value: number): StatusDefinition | undefined {
    return STATUSES.find((s) => s.value === value);
  }

  async validateData(
    status: number,
    data: unknown,
  ): Promise<DataValidationResult> {
    const statusDef = this.getStatus(status);
    if (!statusDef) {
      return { valid: false, errors: [`Unknown status ${status}`] };
    }
    if (!statusDef.dataSchema) {
      return { valid: true, data: {} };
    }
    // `data` is the task's accumulated payload across all statuses ever visited, so it may
    // legitimately carry fields outside this status's schema (e.g. an earlier status's fields);
    // only whitelist-strip for validation, don't reject on unrelated properties.
    const instance = plainToInstance(statusDef.dataSchema, data ?? {});
    const errors = await validate(instance, { whitelist: true });
    if (errors.length > 0) {
      return {
        valid: false,
        errors: errors.flatMap((e) => Object.values(e.constraints ?? {})),
      };
    }
    return { valid: true, data: instanceToPlain(instance) };
  }
}
