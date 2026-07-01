import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { TaskWorkflowService } from "../task-types/task-workflow.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TransitionTaskDto } from "./dto/transition-task.dto";
import { AssigneeActionDto } from "./dto/assignee-action.dto";
import { FindTasksDto } from "./dto/find-tasks.dto";

@Controller("tasks")
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly taskWorkflowService: TaskWorkflowService,
  ) {}

  @Get()
  findAll(@Query() query: FindTasksDto) {
    return this.tasksService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Post(":id/transition")
  transition(@Param("id") id: string, @Body() dto: TransitionTaskDto) {
    return this.taskWorkflowService.transition(id, dto);
  }

  @Post(":id/close")
  close(@Param("id") id: string, @Body() dto: AssigneeActionDto) {
    return this.taskWorkflowService.close(id, dto.assigneeId);
  }

  @Post(":id/reopen")
  reopen(@Param("id") id: string, @Body() dto: AssigneeActionDto) {
    return this.taskWorkflowService.reopen(id, dto.assigneeId);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.tasksService.remove(id);
  }
}
