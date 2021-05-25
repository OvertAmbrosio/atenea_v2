import { PartialType } from '@nestjs/mapped-types';

import { Empleado } from 'src/api/empleados/schema/empleado.schema';
import { CreateOrdeneDto } from './create-ordene.dto';

export class UpdateOrdeneDto extends PartialType(CreateOrdeneDto) {
  readonly estado_liquidado?: string;
  readonly tecnico_liquidado?: Empleado['_id'];
  readonly nombre_liquidado?: string;
  readonly fecha_liquidado?: Date;
  readonly tipo_averia?: string;
  readonly codigo_usuario_liquidado?: string;
  readonly observacion_liquidado?: string;
  readonly descripcion_codigo_liquidado?: string;
  readonly tipo_liquidacion: string;
}
