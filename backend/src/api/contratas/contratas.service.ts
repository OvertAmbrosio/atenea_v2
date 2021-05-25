import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Contrata, ContrataDocument } from './schema/contrata.schema';
import { RedisService } from 'src/database/redis.service';
import { CreateContrataDto } from './dto/create-contrata.dto';
import { UpdateContrataDto } from './dto/update-contrata.dto';
import { redisKeys } from 'src/config/redisKeys';

@Injectable()
export class ContratasService {
  constructor (
    @InjectModel('Contrata') private readonly contrataModel: Model<ContrataDocument>,
    private readonly redisService: RedisService
  ){}

  public async crearContrata(createContrataDto: CreateContrataDto):Promise<Contrata> {
    await this.redisService.remove(redisKeys.CONTRATAS);
    return await new this.contrataModel(createContrataDto).save();
  };

  public async listarTodo():Promise<Contrata[]> {
   return await this.contrataModel.find().populate({
     path: 'jefe',
     model: 'Empleado',
     select: 'nombre apellidos'
   }).populate('zonas').sort('nombre');
  };

  public async listarNombres():Promise<Contrata[]> {
    const contratas:any = await this.redisService.get(redisKeys.CONTRATAS);

    if (contratas) {
      return JSON.parse(contratas);
    } else {
      return await this.contrataModel.find({ activo: true })
        .populate('zonas','nombre')
        .select('nombre zonas')
        .sort('nombre')
        .then(async(objC) => {
          await this.redisService.set(redisKeys.CONTRATAS, JSON.stringify(objC), 86400);
          return objC;
      });
    }
  };

  public async actualizarContrata(id: string, updateContrataDto: UpdateContrataDto):Promise<Contrata> {
    await this.redisService.remove(redisKeys.CONTRATAS);
    return await this.contrataModel.findByIdAndUpdate(id, { $set: updateContrataDto });
  };

  public async modificarEstadoContrata(id: string, activo: boolean, fecha_baja: Date):Promise<Contrata> {
    const fb = fecha_baja && !activo ? fecha_baja : null;

    await this.redisService.remove(redisKeys.CONTRATAS);
    return await this.contrataModel.findByIdAndUpdate(id, { $set: { activo, fecha_baja: fb } });
  };
}
