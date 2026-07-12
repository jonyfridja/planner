import { Module, OnModuleInit } from "@nestjs/common";
import { TaskTypeRegistry } from "../task-type.registry";
import { HRTaskTypeDefinition } from "./hr-task-type.definition";

@Module({
  providers: [HRTaskTypeDefinition],
})
export class HRModule implements OnModuleInit {
  constructor(
    private readonly registry: TaskTypeRegistry,
    private readonly definition: HRTaskTypeDefinition,
  ) {}

  onModuleInit(): void {
    this.registry.register(this.definition);
  }
}
