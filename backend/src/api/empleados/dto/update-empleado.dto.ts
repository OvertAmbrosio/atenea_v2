import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsDate, IsString } from 'class-validator';
import { Empleado } from '../schema/empleado.schema';
import { CreateEmpleadoDto } from './create-empleado.dto';

export class UpdateEmpleadoDto extends PartialType(CreateEmpleadoDto) {
  @IsString()
  readonly tecnico?: Empleado["_id"];

  @IsString()
  readonly gestor?: Empleado["_id"];

  @IsString()
  readonly auditor?: Empleado["_id"];

  @IsString()
  readonly supervisor?: Empleado["_id"];

  @IsString()
  readonly tipo_negocio?: string;

  @IsString()
  readonly sub_tipo_negocio?: string;

  @IsDate()
  readonly fecha_baja?: Date;

  @IsString()
  readonly estado_empresa?: string;

  @IsString()
  readonly observacion?: string;

  @IsArray()
  readonly columnas?: string[];
}
