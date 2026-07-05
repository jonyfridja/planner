import { Global, Module } from "@nestjs/common";
import { TaskTypeRegistry } from "./task-type.registry";
import { TaskTypesController } from "./task-types.controller";
import { ProcurementModule } from "./procurement/procurement.module";
import { DevelopmentModule } from "./development/development.module";

@Global()
@Module({
  imports: [ProcurementModule, DevelopmentModule],
  controllers: [TaskTypesController],
  providers: [TaskTypeRegistry],
  exports: [TaskTypeRegistry],
})
export class TaskTypesModule {}
