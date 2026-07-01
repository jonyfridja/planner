import { IsOptional, IsString, IsUUID } from "class-validator";

export class FindTasksDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;
}
