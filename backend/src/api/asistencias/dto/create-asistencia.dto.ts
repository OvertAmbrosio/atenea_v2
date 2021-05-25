import { IsArray, IsDate, IsNotEmpty, IsString } from "class-validator";
import { Cargo } from "src/api/cargos/schema/cargo.schema";
import { Empleado } from "src/api/empleados/schema/empleado.schema";
import { HistorialRegistro } from "../schema/asistencia.schema";

export class CreateAsistenciaDto {
  /**INICIO solo para el registro */
  @IsDate()
  readonly fecha: Date;

  @IsString()
  readonly observacion: string;
  /** FIN solo para el registro */
  @IsString()
  @IsNotEmpty()
  cargo: Cargo["_id"];

  @IsString()
  @IsNotEmpty()
  empleado: Partial<Empleado>;

  @IsString()
  readonly estado: string;

  @IsDate()
  fecha_asistencia: Date;

  @IsArray()
  historial_registro: HistorialRegistro[];
};
