import { Controller, Get, Post, Body, Put, Param, Delete, Inject, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { handleError } from 'src/helpers/handleResponseApi';
import { tipoStatus, TPayload, TRespuesta } from '../common/apiResponse';
import { metodos, niveles } from 'src/enums';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('areas')
export class AreasController {
  constructor(
    private readonly areasService: AreasService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  @Post()
  async crearArea(@Req() req:Request, @Body("metodo") metodo:string, @Body("data") createAreaDto: CreateAreaDto): Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.AREA_CREAR && usuario.nivel < niveles.JEFES_AREA) {
      return await this.areasService.crearArea(createAreaDto).then(() => ({
        status: tipoStatus.SUCCESS,
        message: "Area creado correctamente."
      })).catch((err) => handleError(this.logger, metodos.AREA_CREAR, err));
    } else {
      throw new HttpException("Metodo incorrecto o nivel fuera de rango.", HttpStatus.UNAUTHORIZED);
    };
  };

  @Get()
  async listarAreas(): Promise<TRespuesta> {
    return await this.areasService.listarAreas().then((data) => {
      if (data) {
        return ({
          status: tipoStatus.SUCCESS,
          message: "Areas obtenidos correctamente.",
          data
        });
      } else {
        return ({
          status: tipoStatus.WARN,
          message: "No se encontraron registros.",
          data: null
        })
      }
    }).catch((err) => handleError(this.logger, "listarAreas", err));
  }

  @Put('/:id')
  async actualizarArea(@Req() req:Request, @Param('id') id: string, @Body("metodo") metodo:string, @Body("data") updateAreaDto: UpdateAreaDto): Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.AREA_ACTUALIZAR && usuario.nivel < niveles.JEFES_AREA) {
      return await this.areasService.actualizarArea(id, updateAreaDto).then((data) => {
        if (data) {
          return ({
            status: tipoStatus.SUCCESS,
            message: "Areas actualizado correctamente.",
            data
          });
        } else {
          return ({
            status: tipoStatus.WARN,
            message: "No se encontró un area con ese id.",
            data: null
          })
        }
      }).catch((err) => handleError(this.logger, metodos.AREA_ACTUALIZAR, err));
    } else {
      throw new HttpException("Metodo incorrecto o nivel fuera de rango.", HttpStatus.UNAUTHORIZED);
    };
  };

  @Delete('/:id')
  async borrarArea(@Req() req:Request, @Body("metodo") metodo:string, @Param('id') id: string): Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.AREA_BORRAR && usuario.nivel < niveles.JEFES_AREA) {
      return await this.areasService.borrarArea(id).then((data) => {
        if (data) {
          return ({
            status: tipoStatus.SUCCESS,
            message: "Area eliminado correctamente.",
            data
          });
        } else {
          return ({
            status: tipoStatus.WARN,
            message: "No se encontró un area con ese id.",
            data: null
          })
        }
      }).catch((err) => handleError(this.logger, metodos.AREA_BORRAR, err));
    } else {
      throw new HttpException("Metodo incorrecto o nivel fuera de rango.", HttpStatus.UNAUTHORIZED);
    };
  };
}
