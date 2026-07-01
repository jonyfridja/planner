import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import type { CreateTaskDto as CreateTaskDtoShape } from "@planner/shared";

export class CreateTaskDto implements CreateTaskDtoShape {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  taskType!: string;

  @IsUUID()
  assigneeId!: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, unknown>;
}
