import { IsNotEmpty, IsString } from "class-validator";

export class SpecificationCompletedDataDto {
  @IsString()
  @IsNotEmpty()
  specification!: string;
}
