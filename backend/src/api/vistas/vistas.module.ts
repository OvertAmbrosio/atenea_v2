import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RedisModule } from 'src/database/redis.module';
import { VistasService } from './vistas.service';
import { VistasController } from './vistas.controller';
import { Vista, VistaSchema } from './schema/vista.shema';
import { variables } from 'src/config';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Vista.name,
      schema: VistaSchema
    }], variables.db_name),
    RedisModule
  ],
  controllers: [VistasController],
  providers: [VistasService],
  exports: [VistasService]
})
export class VistasModule {}
