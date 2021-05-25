import { MaxLength, IsNotEmpty, IsString, IsArray} from 'class-validator';

export class CreateZonaDto {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  readonly nombre: string;
  
  @IsArray()
  @IsNotEmpty()
  readonly nodos: Array<string>;
}
