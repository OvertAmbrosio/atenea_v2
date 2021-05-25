import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoempleadoDto } from './create-tipoempleado.dto';

export class UpdateTipoempleadoDto extends PartialType(CreateTipoempleadoDto) {}
