import { IsNotEmpty, IsString } from "class-validator";

export class DevelopmentCompletedDataDto {
  @IsString()
  @IsNotEmpty()
  branchName!: string;
}
