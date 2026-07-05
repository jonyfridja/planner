import { Module, OnModuleInit } from "@nestjs/common";
import { TaskTypeRegistry } from "../task-type.registry";
import { DevelopmentTaskTypeDefinition } from "./development-task-type.definition";

@Module({
  providers: [DevelopmentTaskTypeDefinition],
})
export class DevelopmentModule implements OnModuleInit {
  constructor(
    private readonly registry: TaskTypeRegistry,
    private readonly definition: DevelopmentTaskTypeDefinition,
  ) {}

  onModuleInit(): void {
    this.registry.register(this.definition);
  }
}
