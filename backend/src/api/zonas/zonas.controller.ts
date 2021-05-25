import { Controller, Get, Post, Body, Put, Param, Delete, Inject, HttpException, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ZonasService } from './zonas.service';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';
import { tipoStatus, TPayload, TRespuesta } from '../common/apiResponse';
import { handleError } from 'src/helpers/handleResponseApi';
import { metodos, niveles } from 'src/enums';

@UseGuards(JwtAuthGuard)
@Controller('zonas')
export class ZonasController {
  constructor(
    private readonly zonasService: ZonasService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  @Post()
  async crearZona(@Body("metodo") metodo:string, @Body("data") createZonaDto:CreateZonaDto, @Req() req:Request): Promise<TRespuesta> {
    const user:TPayload = req.user;
    if (metodo === metodos.ZONA_CREAR && user.nivel <= niveles.JEFES_AREA ) {
      return await this.zonasService.crearZona(createZonaDto).then(() => ({
        status: tipoStatus.SUCCESS,
        message: 'Zona creada correctamente.'
      })).catch((err) => handleError(this.logger, metodos.ZONA_CREAR, err));
    } else {
      throw new HttpException("Metodo incorrecto o nivel fuera de rango.", HttpStatus.UNAUTHORIZED);
    };
  };

  @Get()
  async listarZonas(): Promise<TRespuesta> {
    return await this.zonasService.listarZonas().then((data) => {
      if (data) {
        return({
          status: tipoStatus.SUCCESS,
          message: 'Zonas obtenidas correctamente.',
          data,
        });
      } else {
        return({
          status: tipoStatus.WARN,
          message: 'No se han encontrado registros.',
          data: null,
        });
      };
    }).catch((err) => handleError(this.logger, "listarZonas", err));;
  };

  @Put('/:id')
  async actualizarZona(@Param('id') id: string,@Body("metodo") metodo:string, @Body("data") updateZonaDto: UpdateZonaDto, @Req() req:Request): Promise<TRespuesta> {
    const user:TPayload = req.user;
    if (metodo === metodos.ZONA_ACTUALIZAR && user.nivel <= niveles.JEFES_AREA) {
      return await this.zonasService.actualizarZona(id, updateZonaDto).then((data) => {
        if (data) {
          return({
            status: tipoStatus.SUCCESS,
            message: 'Zona actualizada correctamente.',
            data,
          });
        } else {
          return({
            status: tipoStatus.WARN,
            message: 'No se encontró registros con el Id.',
            data: null,
          });
        };
      }).catch((err) => handleError(this.logger, metodos.ZONA_ACTUALIZAR, err));
    } else {
      throw new HttpException("Metodo incorrecto o nivel fuera de rango.", HttpStatus.UNAUTHORIZED);
    };
  };

  @Delete('/:id')
  async borrarZona(@Req() req:Request, @Param('id') id: string,@Body("metodo") metodo:string): Promise<TRespuesta> {
    const user:TPayload = req.user;
    if (metodo === metodos.ZONA_ACTUALIZAR && user.nivel <= niveles.JEFES_AREA) {
      return await this.zonasService.borrarZona(id).then((data) => {
        if (data) {
          return({
            status: tipoStatus.SUCCESS,
            message: 'Zona borrada correctamente.',
            data,
          });
        } else {
          return({
            status: tipoStatus.WARN,
            message: 'No se encontró registros con el Id.',
            data: null,
          });
        };
      }).catch((err) => handleError(this.logger, metodos.ZONA_ACTUALIZAR, err));
    } else {
      throw new HttpException("Metodo incorrecto o nivel fuera de rango.", HttpStatus.UNAUTHORIZED);
    };
  };
};
