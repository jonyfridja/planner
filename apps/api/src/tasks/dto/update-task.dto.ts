import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import type {
  TaskStatus,
  UpdateTaskDto as UpdateTaskDtoShape,
} from "@planner/shared";

const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

export class UpdateTaskDto implements UpdateTaskDtoShape {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(TASK_STATUSES)
  @IsOptional()
  status?: TaskStatus;
}
