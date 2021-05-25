import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TipoempleadosService } from './tipoempleados.service';
import { TipoempleadosController } from './tipoempleados.controller';
import { Tipoempleado, TipoempleadoSchema } from './schema/tipoempleado.schema';
import { variables } from 'src/config';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Tipoempleado.name,
      schema: TipoempleadoSchema
    }], variables.db_name)
  ],
  controllers: [TipoempleadosController],
  providers: [TipoempleadosService],
  exports: [TipoempleadosService]
})
export class TipoempleadosModule {}
