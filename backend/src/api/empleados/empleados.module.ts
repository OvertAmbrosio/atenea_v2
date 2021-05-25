import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';

import { EmpleadosService } from './empleados.service';
import { EmpleadosController } from './empleados.controller';
import { EmpleadoSchema } from './schema/empleado.schema';
import { variables } from 'src/config';
import { RedisModule } from 'src/database/redis.module';
import { CargosModule } from '../cargos/cargos.module';
import { VistasModule } from '../vistas/vistas.module';
import { TipoempleadosModule } from '../tipoempleados/tipoempleados.module';
import { ZonasModule } from '../zonas/zonas.module';
import { AsistenciasModule } from '../asistencias/asistencias.module';

@Module({
  imports: [
    forwardRef(() => AsistenciasModule),
    ZonasModule,
    TipoempleadosModule,
    VistasModule,
    CargosModule,
    PassportModule,
    RedisModule,
    MongooseModule.forFeature([{
      name: 'Empleado',
      schema: EmpleadoSchema
    }], variables.db_name),
  ],
  controllers: [EmpleadosController],
  providers: [EmpleadosService],
  exports: [EmpleadosService]
})
export class EmpleadosModule {}
