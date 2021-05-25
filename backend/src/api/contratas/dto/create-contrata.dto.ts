import { MaxLength, IsNotEmpty, IsString, IsDate, IsBoolean, IsArray } from 'class-validator';
import { Empleado } from 'src/api/empleados/schema/empleado.schema';

import { Zona } from 'src/api/zonas/schema/zona.schema';

export class CreateContrataDto {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  readonly nombre: string;

  @IsArray()
  readonly zonas: Zona['_id'][];

  @IsString()
  @MaxLength(15)
  readonly ruc: string;

  readonly jefe: Empleado['_id'];

  @IsString()
  readonly representante: string;

  @IsDate()
  readonly fecha_incorporacion: Date;

  @IsBoolean()
  readonly activo: boolean;

  @IsString()
  @MaxLength(200)
  readonly observacion: string;
}
