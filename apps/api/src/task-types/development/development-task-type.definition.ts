import { Injectable } from "@nestjs/common";
import { plainToInstance, instanceToPlain } from "class-transformer";
import { validate } from "class-validator";
import type {
  DataValidationResult,
  StatusDefinition,
  TaskTypeDefinition,
} from "../task-type-definition.interface";
import { SpecificationCompletedDataDto } from "./dto/specification-completed.dto";
import { DevelopmentCompletedDataDto } from "./dto/development-completed.dto";
import { DistributionCompletedDataDto } from "./dto/distribution-completed.dto";

const STATUSES: StatusDefinition[] = [
  { value: 1, label: "Created", fields: [], requiredRole: "requester" },
  {
    value: 2,
    label: "Specification completed",
    dataSchema: SpecificationCompletedDataDto,
    fields: [{ name: "specification", label: "Specification", type: "string", required: true }],
    requiredRole: "analyst",
  },
  {
    value: 3,
    label: "Development completed",
    dataSchema: DevelopmentCompletedDataDto,
    fields: [{ name: "branchName", label: "Branch Name", type: "string", required: true }],
    requiredRole: "developer",
  },
  {
    value: 4,
    label: "Distribution completed",
    dataSchema: DistributionCompletedDataDto,
    fields: [{ name: "version", label: "Version", type: "string", required: true }],
    requiredRole: "publisher",
  },
];

@Injectable()
export class DevelopmentTaskTypeDefinition implements TaskTypeDefinition {
  readonly type = "development";
  readonly label = "Development Task";

  getStatuses(): StatusDefinition[] {
    return STATUSES;
  }

  getFinalStatus(): number {
    return 4;
  }

  getStatus(value: number): StatusDefinition | undefined {
    return STATUSES.find((s) => s.value === value);
  }

  async validateData(status: number, data: unknown): Promise<DataValidationResult> {
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
