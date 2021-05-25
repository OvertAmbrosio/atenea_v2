import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RedisModule } from 'src/database/redis.module';
import { ZonasService } from './zonas.service';
import { ZonasController } from './zonas.controller';
import { Zona, ZonaSchema } from './schema/zona.schema';
import { variables } from 'src/config';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Zona.name,
      schema: ZonaSchema
    }], variables.db_name),
    RedisModule
  ],
  controllers: [ZonasController],
  providers: [ZonasService],
  exports: [ZonasService]
})
export class ZonasModule {}
