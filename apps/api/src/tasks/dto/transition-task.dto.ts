import { IsInt, IsObject, IsOptional, IsUUID } from "class-validator";
import type { TransitionTaskDto as TransitionTaskDtoShape } from "@planner/shared";

export class TransitionTaskDto implements TransitionTaskDtoShape {
  @IsInt()
  status!: number;

  @IsUUID()
  assigneeId!: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, unknown>;
}
