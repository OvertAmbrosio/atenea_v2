import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { redisKeys } from 'src/config/redisKeys';

import { Cargo, CargoDocument } from './schema/cargo.schema';
import { RedisService } from 'src/database/redis.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { niveles } from 'src/enums';

@Injectable()
export class CargosService {
  constructor(
    @InjectModel('Cargo') private readonly cargoModel: Model<CargoDocument>,
    private readonly redisService: RedisService
  ){}

  async buscarCargo(id:string): Promise<Cargo> {
    return await this.cargoModel.findById(id);
  };

  async buscarCargoNombre(nombre:string): Promise<Cargo> {
    return await this.cargoModel.findOne({nombre});
  };

  async buscarCargoNivel(nivel:number): Promise<Cargo> {
    return await this.cargoModel.findOne({nivel});
  };

  public async crearCargo(createCargoDto: CreateCargoDto): Promise<Cargo> {
    await this.redisService.remove(redisKeys.CARGOS);
    return await new this.cargoModel(createCargoDto).save();
  };

  public async listarCargos(nivel:number): Promise<Cargo[]> {
    return await this.redisService.get(redisKeys.CARGOS).then(async(str:any) => {
      if (str) {
        const data = JSON.parse(str);
        if (nivel < niveles.JEFES_AREA) {
          return data;
        } else {
          return data.filter((e:Cargo) => e.nivel > nivel);
        };
      } else {
        return await this.cargoModel.find().sort("nivel").then(async(data) => {
          await this.redisService.set(redisKeys.CARGOS, JSON.stringify(data), 86400);
          if (nivel < niveles.JEFES_AREA) {
            return data;
          } else {
            return data.filter((e:Cargo) => e.nivel > nivel);
          };
        })
      }
    })
  };

  public async actualizarCargo(id: string, updateCargoDto: UpdateCargoDto): Promise<Cargo> {
    await this.redisService.remove(redisKeys.CARGOS);
    return await this.cargoModel.findByIdAndUpdate(id, updateCargoDto);
  };
   
  public async borrarCargo(id: string): Promise<Cargo> {
    await this.redisService.remove(redisKeys.CARGOS);
    return await this.cargoModel.findByIdAndRemove(id);
  };
};
