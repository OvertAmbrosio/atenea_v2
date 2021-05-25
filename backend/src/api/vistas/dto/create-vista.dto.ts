import { MaxLength, IsNotEmpty, IsString, IsArray } from 'class-validator';
import { Area } from 'src/api/areas/schema/area.schema';
import { Cargo } from 'src/api/cargos/schema/cargo.schema';
import { Tipoempleado } from 'src/api/tipoempleados/schema/tipoempleado.schema';

export class CreateVistaDto {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  readonly titulo:string;

  @IsString()
  @IsNotEmpty()
  readonly ruta:string;

  @IsArray()
  @IsNotEmpty()
  readonly cargos:Cargo["_id"][];

  @IsArray()
  @IsNotEmpty()
  readonly tipos_empleado:Tipoempleado["_id"][];

  @IsArray()
  @IsNotEmpty()
  readonly areas:Area["_id"][];
};
