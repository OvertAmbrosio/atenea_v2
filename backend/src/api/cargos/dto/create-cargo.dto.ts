import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCargoDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsNumber()
  @IsNotEmpty()
  readonly nivel: number;

};
