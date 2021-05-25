import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RedisModule } from 'src/database/redis.module';
import { AreasService } from './areas.service';
import { AreasController } from './areas.controller';
import { AreaSchema } from './schema/area.schema';
import { variables } from 'src/config';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: 'Area',
      schema: AreaSchema
    }], variables.db_name),
    RedisModule
  ],
  controllers: [AreasController],
  providers: [AreasService]
})
export class AreasModule {}
