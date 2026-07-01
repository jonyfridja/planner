import { Module, OnModuleInit } from "@nestjs/common";
import { TaskTypeRegistry } from "../task-type.registry";
import { ProcurementTaskTypeDefinition } from "./procurement-task-type.definition";

@Module({
  providers: [ProcurementTaskTypeDefinition],
})
export class ProcurementModule implements OnModuleInit {
  constructor(
    private readonly registry: TaskTypeRegistry,
    private readonly definition: ProcurementTaskTypeDefinition,
  ) {}

  onModuleInit(): void {
    this.registry.register(this.definition);
  }
}
