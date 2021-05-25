import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { redisKeys } from 'src/config/redisKeys';

import { Area, AreaDocument } from './schema/area.schema';
import { RedisService } from 'src/database/redis.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AreasService {
  constructor(
    @InjectModel('Area') private readonly areaModel: Model<AreaDocument>,
    private readonly redisService: RedisService
  ){}

  async crearArea(createAreaDto: CreateAreaDto): Promise<Area> {
    await this.redisService.remove(redisKeys.AREAS);
    return await new this.areaModel(createAreaDto).save();
  };

  async listarAreas(): Promise<Area[]> {
    return await this.redisService.get(redisKeys.AREAS).then(async(str:any) => {
      if (str) {
        return JSON.parse(str);
      } else {
        return await this.areaModel.find().then(async(data) => {
          await this.redisService.set(redisKeys.AREAS, JSON.stringify(data), 86400);
          return data;
        })
      }
    });
  };

  public async actualizarArea(id: string, updateAreaDto: UpdateAreaDto): Promise<Area> {
    await this.redisService.remove(redisKeys.AREAS);
    return await this.areaModel.findByIdAndUpdate(id, updateAreaDto);
  };
   
  public async borrarArea(id: string): Promise<Area> {
    await this.redisService.remove(redisKeys.AREAS);
    return await this.areaModel.findByIdAndRemove(id);
  };
}
