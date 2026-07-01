import { Injectable } from "@nestjs/common";
import { plainToInstance, instanceToPlain } from "class-transformer";
import { validate } from "class-validator";
import type {
  DataValidationResult,
  StatusDefinition,
  TaskTypeDefinition,
} from "../task-type-definition.interface";
import { SupplierOffersReceivedDataDto } from "./dto/supplier-offers-received.dto";
import { PurchaseCompletedDataDto } from "./dto/purchase-completed.dto";

const STATUSES: StatusDefinition[] = [
  { value: 1, label: "Created", fields: [] },
  {
    value: 2,
    label: "Supplier offers received",
    dataSchema: SupplierOffersReceivedDataDto,
    fields: [
      { name: "quote1", label: "Price Quote 1", type: "string", required: true },
      { name: "quote2", label: "Price Quote 2", type: "string", required: true },
    ],
  },
  {
    value: 3,
    label: "Purchase completed",
    dataSchema: PurchaseCompletedDataDto,
    fields: [{ name: "receipt", label: "Receipt", type: "string", required: true }],
  },
];

@Injectable()
export class ProcurementTaskTypeDefinition implements TaskTypeDefinition {
  readonly type = "procurement";
  readonly label = "Procurement Task";

  getStatuses(): StatusDefinition[] {
    return STATUSES;
  }

  getFinalStatus(): number {
    return 3;
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
