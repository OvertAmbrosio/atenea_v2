import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RedisModule } from 'src/database/redis.module';
import { ContratasService } from './contratas.service';
import { ContratasController } from './contratas.controller';
import { ContrataSchema } from './schema/contrata.schema';
import { variables } from 'src/config';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: 'Contrata',
      schema: ContrataSchema
    }], variables.db_name),
    RedisModule
  ],
  controllers: [ContratasController],
  providers: [ContratasService]
})
export class ContratasModule {}
