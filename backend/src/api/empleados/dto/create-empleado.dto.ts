import { IsNotEmpty, IsString, IsNumber, IsArray, IsDate} from 'class-validator';
import { Area } from 'src/api/areas/schema/area.schema';

import { Cargo } from 'src/api/cargos/schema/cargo.schema';
import { Contrata } from 'src/api/contratas/schema/contrata.schema';
import { Tipoempleado } from 'src/api/tipoempleados/schema/tipoempleado.schema';
import { Vista } from 'src/api/vistas/schema/vista.shema';
import { Zona } from 'src/api/zonas/schema/zona.schema';

export class CreateEmpleadoDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  readonly apellidos: string;

  @IsString()
  readonly carnet?: string;

  @IsString()
  @IsNotEmpty()
  readonly contrata?: Contrata["_id"];

  @IsNumber()
  @IsNotEmpty()
  nivel: number;

  @IsString()
  @IsNotEmpty()
  cargo: Cargo["_id"];

  @IsString()
  @IsNotEmpty()
  readonly tipo_empleado: Tipoempleado["_id"];
  
  @IsString()
  @IsNotEmpty()
  readonly area: Area["_id"];

  @IsArray()
  @IsNotEmpty()
  readonly zonas: Zona["_id"][];

  @IsArray()
  vistas?: Vista["_id"][];

  @IsDate()
  readonly fecha_nacimiento?: Date;

  @IsString()
  readonly numero_documento?: string;

  @IsString()
  readonly tipo_documento?: string;

  @IsString()
  readonly numero_celular?: string;

  @IsDate()
  readonly fecha_ingreso?: Date;

  @IsString()
  readonly nacionalidad?: string;

  @IsString()
  readonly observacion?: string;
}
