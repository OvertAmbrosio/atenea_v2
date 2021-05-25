import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { redisKeys } from 'src/config/redisKeys';
import { RedisService } from 'src/database/redis.service';

import { CreateVistaDto } from './dto/create-vista.dto';
import { UpdateVistaDto } from './dto/update-vista.dto';
import { Vista, VistaDocument } from './schema/vista.shema';

@Injectable()
export class VistasService {
  constructor (
    @InjectModel('Vista') private readonly vistaModel: Model<VistaDocument>,
    private readonly redisService: RedisService
  ){}

  async buscarVistas(area:string, tipo:string, cargo:string): Promise<Vista[]> {
    return await this.vistaModel.find({
      areas: { $elemMatch: { $eq: Types.ObjectId(area) }},
      tipos_empleado: { $elemMatch: { $eq: Types.ObjectId(tipo) }}, 
      cargos: { $elemMatch: { $eq: Types.ObjectId(cargo) }}
    })
  };

  public async crearVista(createVistaDto: CreateVistaDto): Promise<Vista> {
    await this.redisService.remove(redisKeys.VISTAS);
    return await new this.vistaModel(createVistaDto).save()
  };

  public async listarVistas(): Promise<Vista[]> {
    return await this.redisService.get(redisKeys.VISTAS).then(async(str:string) => {
      if (str) {
        const jsonVistas:Vista[] = JSON.parse(str);
        return jsonVistas;
      } else {
        return await this.vistaModel.find().populate('cargos tipos_empleado areas', 'nombre').then(async(data) => {
          await this.redisService.set(redisKeys.VISTAS, JSON.stringify(data), 86400);
          return data;
        })
      };
    });
  }; 

  public async actualizarVista(id: string, updateVistaDto: UpdateVistaDto) {
    await this.redisService.remove(redisKeys.VISTAS);
    return await this.vistaModel.findByIdAndUpdate(id, updateVistaDto);
  };

  public async borrarVista(id: string) {
    await this.redisService.remove(redisKeys.VISTAS);
    return await this.vistaModel.findByIdAndRemove(id);
  };
}
