import { IsNotEmpty, IsString } from "class-validator";

export class DistributionCompletedDataDto {
  @IsString()
  @IsNotEmpty()
  version!: string;
}
