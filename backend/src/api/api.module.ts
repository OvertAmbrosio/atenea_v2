import { Module } from '@nestjs/common';

import { EmpleadosModule } from './empleados/empleados.module';
import { ContratasModule } from './contratas/contratas.module';
import { CargosModule } from './cargos/cargos.module';
import { VistasModule } from './vistas/vistas.module';
import { ZonasModule } from './zonas/zonas.module';
import { AreasModule } from './areas/areas.module';
import { TipoempleadosModule } from './tipoempleados/tipoempleados.module';
import { AsistenciasModule } from './asistencias/asistencias.module';
import { OrdenesModule } from './ordenes/ordenes.module';

@Module({
  imports: [
    EmpleadosModule, 
    ContratasModule, 
    CargosModule, 
    VistasModule, 
    ZonasModule, 
    AreasModule, 
    TipoempleadosModule, 
    AsistenciasModule, 
    OrdenesModule,
  ],
})

export class ApiModule {}
