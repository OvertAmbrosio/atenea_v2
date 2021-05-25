import { Controller, Get, Post, Body, Put, Param, Delete, Inject, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { metodos, niveles } from 'src/enums';

import { handleError } from 'src/helpers/handleResponseApi';
import { Logger } from 'winston';
import { tipoStatus, TPayload, TRespuesta } from '../common/apiResponse';
import { CargosService } from './cargos.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';

@UseGuards(JwtAuthGuard)
@Controller('cargos')
export class CargosController {
  constructor(
    private readonly cargosService: CargosService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  @Post()
  async crearCargo(@Req() req:Request, @Body("metodo") metodo:string, @Body("data") createCargoDto: CreateCargoDto): Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.CARGO_CREAR && usuario.nivel <= niveles.JEFES_AREA) {
      return await this.cargosService.crearCargo(createCargoDto).then(() => ({
        status: tipoStatus.SUCCESS,
        message: "Cargo creado correctamente."
      })).catch((err) => handleError(this.logger, metodos.CARGO_CREAR, err));
    } else {
      throw new HttpException("Metodo incorrecto o nivel fuera de rango.", HttpStatus.UNAUTHORIZED);
    };
  };

  @Get()
  async listarCargos(@Req() req:Request): Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    return await this.cargosService.listarCargos(usuario.nivel).then((data) => {
      if (data) {
        return ({
          status: tipoStatus.SUCCESS,
          message: "Cargos obtenidos correctamente.",
          data
        });
      } else {
        return ({
          status: tipoStatus.WARN,
          message: "No se encontraron registros.",
          data: null
        })
      }
    }).catch((err) => handleError(this.logger, "listarCargos", err));
  };

  @Put('/:id')
  async actualizarCargo(@Req() req:Request, @Param('id') id: string, @Body("metodo") metodo:string, @Body("data") updateCargoDto: UpdateCargoDto): Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.CARGO_ACTUALIZAR && usuario.nivel <= niveles.JEFES_AREA) {
      return await this.cargosService.actualizarCargo(id, updateCargoDto).then((data) => {
        if (data) {
          return ({
            status: tipoStatus.SUCCESS,
            message: "Cargo actualizado correctamente.",
            data
          });
        } else {
          return ({
            status: tipoStatus.WARN,
            message: "No se encontró un cargo con ese id.",
            data: null
          })
        }
      }).catch((err) => handleError(this.logger, metodos.CARGO_ACTUALIZAR, err));
    } else {
      throw new HttpException("Metodo incorrecto o nivel fuera de rango.", HttpStatus.UNAUTHORIZED);
    };
  };

  @Delete('/:id')
  async borrarCargo(@Req() req:Request, @Param('id') id: string, @Body("metodo") metodo:string): Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.CARGO_BORRAR && usuario.nivel <= niveles.JEFES_AREA) {
      return await this.cargosService.borrarCargo(id).then((data) => {
        if (data) {
          return ({
            status: tipoStatus.SUCCESS,
            message: "Cargo eliminado correctamente.",
            data
          });
        } else {
          return ({
            status: tipoStatus.WARN,
            message: "No se encontró un cargo con ese id.",
            data: null
          })
        }
      }).catch((err) => handleError(this.logger, metodos.CARGO_BORRAR, err));
    } else {
      throw new HttpException("Metodo incorrecto o nivel fuera de rango.", HttpStatus.UNAUTHORIZED);
    };
  };
}
