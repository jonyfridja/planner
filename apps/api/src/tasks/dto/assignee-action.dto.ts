import { IsUUID } from "class-validator";
import type { AssigneeActionDto as AssigneeActionDtoShape } from "@planner/shared";

export class AssigneeActionDto implements AssigneeActionDtoShape {
  @IsUUID()
  assigneeId!: string;
}
