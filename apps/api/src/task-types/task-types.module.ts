import { Global, Module } from "@nestjs/common";
import { TaskTypeRegistry } from "./task-type.registry";
import { TaskTypesController } from "./task-types.controller";
import { ProcurementModule } from "./procurement/procurement.module";

@Global()
@Module({
  imports: [ProcurementModule],
  controllers: [TaskTypesController],
  providers: [TaskTypeRegistry],
  exports: [TaskTypeRegistry],
})
export class TaskTypesModule {}
