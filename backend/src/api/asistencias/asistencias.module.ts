import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmpleadosModule } from '../empleados/empleados.module';
import { CargosModule } from '../cargos/cargos.module';
import { AsistenciasService } from './asistencias.service';
import { AsistenciasController } from './asistencias.controller';
import { AsistenciaSchema } from './schema/asistencia.schema';
import { variables } from 'src/config';

@Module({
  imports: [
    forwardRef(() => EmpleadosModule),
    CargosModule,
    MongooseModule.forFeature([{
      name: 'Asistencia',
      schema: AsistenciaSchema
    }], variables.db_name),
  ],
  controllers: [AsistenciasController],
  providers: [AsistenciasService],
  exports: [AsistenciasService]
})
export class AsistenciasModule {}
