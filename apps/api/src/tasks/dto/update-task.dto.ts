import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import type { UpdateTaskDto as UpdateTaskDtoShape } from "@planner/shared";

export class UpdateTaskDto implements UpdateTaskDtoShape {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
