import { IsNotEmpty, IsString } from "class-validator";

export class PurchaseCompletedDataDto {
  @IsString()
  @IsNotEmpty()
  receipt!: string;
}
