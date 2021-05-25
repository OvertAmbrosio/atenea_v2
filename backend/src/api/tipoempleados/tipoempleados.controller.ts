import { Controller, Get, Post, Body, Put, Param, Delete, Inject, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { TipoempleadosService } from './tipoempleados.service';
import { CreateTipoempleadoDto } from './dto/create-tipoempleado.dto';
import { UpdateTipoempleadoDto } from './dto/update-tipoempleado.dto';
import { tipoStatus, TPayload, TRespuesta } from '../common/apiResponse';
import { handleError } from 'src/helpers/handleResponseApi';
import { metodos, niveles } from 'src/enums';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tipoempleados')
export class TipoempleadosController {
  constructor(
    private readonly tipoempleadosService: TipoempleadosService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  @Post()
  async crearTipo(@Req() req:Request, @Body("metodo") metodo:string, @Body("data") createTipoempleadoDto: CreateTipoempleadoDto):Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.TIPOEMPLEADO_CREAR && usuario.nivel <= niveles.JEFES_AREA) {
      return await this.tipoempleadosService.crearTipo(createTipoempleadoDto).then(() => {
        return({
          status: tipoStatus.SUCCESS,
          message: 'Tipo creado correctamente.'
        })
      }).catch((err) => handleError(this.logger, metodos.TIPOEMPLEADO_CREAR, err));
    } else {
      throw new HttpException("Metodo incorrecto o nivel fuera de rango.", HttpStatus.UNAUTHORIZED);
    };
  };

  @Get()
  async listarTodo():Promise<TRespuesta> {
    return await this.tipoempleadosService.listarTipos().then((data) => {
      if (data) {
        return ({
          status: tipoStatus.SUCCESS,
          message: 'Data obtenida correctamente.',
          data
        })
      } else {
        return ({
          status: tipoStatus.WARN,
          message: 'No se encontró data disponible.',
          data: null
        })
      }
    }).catch((err) => handleError(this.logger, "listarTipoEmpleado", err));
  };

  @Put('/:id')
  async actualizarTipo(@Req() req:Request, @Param('id') id: string, @Body("metodo") metodo:string, @Body("data") updateTipoempleadoDto: UpdateTipoempleadoDto):Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.TIPOEMPLEADO_ACTUALIZAR && usuario.nivel <= niveles.JEFES_AREA) {
      return this.tipoempleadosService.actualizarTipo(id, updateTipoempleadoDto).then((data) => {
        if (data) {
          return ({
            status: tipoStatus.SUCCESS,
            message: 'Objeto actualizado correctamente.',
            data
          })
        } else {
          return ({
            status: tipoStatus.WARN,
            message: 'No se encontró el id del objeto.',
            data: null
          })
        }
      }).catch((err) => handleError(this.logger, metodos.TIPOEMPLEADO_ACTUALIZAR, err));
    } else {
      throw new HttpException("Metodo incorrecto o nivel fuera de rango.", HttpStatus.UNAUTHORIZED);
    };
  };

  @Delete('/:id')
  async borrarTipo(@Req() req:Request, @Body("metodo") metodo:string, @Param('id') id: string):Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.TIPOEMPLEADO_BORRAR && usuario.nivel <= niveles.JEFES_AREA) {
      return this.tipoempleadosService.borrarTipo(id).then((data) => {
        if (data) {
          return ({
            status: tipoStatus.SUCCESS,
            message: 'Objeto eliminado correctamente.',
            data
          })
        } else {
          return ({
            status: tipoStatus.WARN,
            message: 'No se encontró el id del objeto.',
            data: null
          })
        }
      }).catch((err) => handleError(this.logger, metodos.TIPOEMPLEADO_BORRAR, err));;
    } else {
      throw new HttpException("Metodo incorrecto o nivel fuera de rango.", HttpStatus.UNAUTHORIZED);
    };
  };
}
