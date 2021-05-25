import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RedisModule } from 'src/database/redis.module';
import { OrdenesService } from './ordenes.service';
import { OrdenesController } from './ordenes.controller';
import { OrdenesGateway } from './ordenes.gateway';
import { variables } from 'src/config';
import { OrdeneSchema } from './schema/ordene.schema';
import { ZonasModule } from '../zonas/zonas.module';
import { EmpleadosModule } from '../empleados/empleados.module';

@Module({
  imports: [
    ZonasModule,
    EmpleadosModule,
    RedisModule,
    HttpModule,
    MongooseModule.forFeature([{
      name: 'Ordene',
      schema: OrdeneSchema
    }], variables.db_name),
  ],
  controllers: [OrdenesController],
  providers: [OrdenesGateway, OrdenesService]
})
export class OrdenesModule {}
