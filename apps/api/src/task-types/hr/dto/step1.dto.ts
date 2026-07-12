import { IsDate, IsNotEmpty, IsNumber } from "class-validator";

export class Step1DataDto {
  @IsNumber()
  @IsNotEmpty()
  budget!: string;

  @IsDate()
  @IsNotEmpty()
  dueDate!: Date;
}
