import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CargosService } from './cargos.service';
import { CargosController } from './cargos.controller';
import { CargoSchema } from './schema/cargo.schema';
import { variables } from 'src/config';
import { RedisModule } from 'src/database/redis.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{
      name: 'Cargo',
      schema: CargoSchema
    }], variables.db_name),
    RedisModule
  ],
  controllers: [CargosController],
  providers: [CargosService],
  exports: [CargosService]
})
export class CargosModule {}
