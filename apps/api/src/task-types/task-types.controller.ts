import { Controller, Get } from "@nestjs/common";
import type { TaskTypeSummary } from "@planner/shared";
import { TaskTypeRegistry } from "./task-type.registry";

@Controller("task-types")
export class TaskTypesController {
  constructor(private readonly registry: TaskTypeRegistry) {}

  @Get()
  list(): TaskTypeSummary[] {
    return this.registry.list().map((definition) => ({
      type: definition.type,
      label: definition.label,
      statuses: definition.getStatuses().map((s) => ({
        value: s.value,
        label: s.label,
        fields: s.fields,
        requiredRole: s.requiredRole,
      })),
      finalStatus: definition.getFinalStatus(),
    }));
  }
}
