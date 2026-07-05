import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Task } from "./task.entity";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";
import { TaskWorkflowService } from "../task-types/task-workflow.service";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([Task]), UsersModule],
  controllers: [TasksController],
  providers: [TasksService, TaskWorkflowService],
})
export class TasksModule {}
