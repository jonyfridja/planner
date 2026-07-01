import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import type { CreateTaskDto as CreateTaskDtoShape } from "@planner/shared";

export class CreateTaskDto implements CreateTaskDtoShape {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
