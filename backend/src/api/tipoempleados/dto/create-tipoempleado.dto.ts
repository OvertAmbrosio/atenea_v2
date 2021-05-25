import { MaxLength, IsNotEmpty, IsString } from 'class-validator';

export class CreateTipoempleadoDto {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @MaxLength(5, { message: "Excede la cantidad de carácteres permitidos." })
  @IsNotEmpty()
  readonly acron: string;
};
