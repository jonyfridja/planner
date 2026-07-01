import { IsNotEmpty, IsString } from "class-validator";

export class SupplierOffersReceivedDataDto {
  @IsString()
  @IsNotEmpty()
  quote1!: string;

  @IsString()
  @IsNotEmpty()
  quote2!: string;
}
