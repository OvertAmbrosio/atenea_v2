import { IsNotEmpty, IsString } from "class-validator";

export class CreateAreaDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  readonly descripcion: string;
};
