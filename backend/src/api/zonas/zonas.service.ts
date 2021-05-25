import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RedisService } from 'src/database/redis.service';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';
import { redisKeys } from 'src/config/redisKeys';
import { Zona } from './schema/zona.schema';

@Injectable()
export class ZonasService {
  constructor (
    @InjectModel('Zona') private readonly zonaModel: Model<Zona>,
    private readonly redisService: RedisService
  ){};

  async buscarZonaNombre(nombre:string):Promise<Zona> {
    return await this.zonaModel.findOne({ nombre });
  };

  public async buscarZona(id:any):Promise<Zona> {
    return await this.zonaModel.findById(id);
  };

  public async crearZona(createZonaDto: CreateZonaDto):Promise<Zona> {
    await this.redisService.remove(redisKeys.ZONAS);
    return await new this.zonaModel(createZonaDto).save();
  };

  public async listarZonas():Promise<Zona[]> {
    const zonas:string|any = await this.redisService.get(redisKeys.ZONAS);
    if (zonas) {
      return JSON.parse(zonas)
    } else {
      return await this.zonaModel.find().then(async(data) => {
        await this.redisService.set(redisKeys.ZONAS, JSON.stringify(data), 86400);
        return data;
      })
    }
  };

  public async actualizarZona(id: string, updateZonaDto: UpdateZonaDto):Promise<Zona> {
    await this.redisService.remove(redisKeys.ZONAS);
    return await this.zonaModel.findByIdAndUpdate(id, updateZonaDto);
  };

  public async borrarZona(id: string) {
    await this.redisService.remove(redisKeys.ZONAS);
    return await this.zonaModel.findByIdAndDelete(id)
  };
};
