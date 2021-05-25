import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsDate } from 'class-validator';
import { CreateAsistenciaDto } from './create-asistencia.dto';

export class UpdateAsistenciaDto extends PartialType(CreateAsistenciaDto) {
  @IsBoolean()
  readonly iniciado: boolean;

  @IsDate()
  readonly fecha_iniciado: Date;

}
