import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateTipoempleadoDto } from './dto/create-tipoempleado.dto';
import { UpdateTipoempleadoDto } from './dto/update-tipoempleado.dto';
import { Tipoempleado, TipoEmpleadoDocument } from './schema/tipoempleado.schema';

@Injectable()
export class TipoempleadosService {
  constructor (
    @InjectModel('Tipoempleado') private readonly tipoEmpleadoModel: Model<TipoEmpleadoDocument>
  ){}

  public async buscarNombre(nombre:string) {
    return await this.tipoEmpleadoModel.findOne({ nombre })
  }

  public async crearTipo(createTipoempleadoDto: CreateTipoempleadoDto) {
    return await new this.tipoEmpleadoModel(createTipoempleadoDto).save();
  };
  
  public async listarTipos(): Promise<Tipoempleado[]> {
    return await this.tipoEmpleadoModel.find();
  };

  public async actualizarTipo(id: string, updateTipoempleadoDto: UpdateTipoempleadoDto):Promise<Tipoempleado> {
    return await this.tipoEmpleadoModel.findByIdAndUpdate(id, updateTipoempleadoDto);
  };

  public async borrarTipo(id: string):Promise<Tipoempleado> {
    return await this.tipoEmpleadoModel.findByIdAndRemove(id);
  };
};
