import { PartialType } from '@nestjs/mapped-types';
import { IsDate } from 'class-validator';
import { CreateContrataDto } from './create-contrata.dto';

export class UpdateContrataDto extends PartialType(CreateContrataDto) {
  @IsDate()
  fecha_baja?: Date;
};
