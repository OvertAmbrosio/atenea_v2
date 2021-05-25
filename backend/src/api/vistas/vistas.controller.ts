import { Controller, Get, Post, Body, Put, Param, Delete, Inject, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { metodos, niveles } from 'src/enums';
import { VistasService } from './vistas.service';
import { CreateVistaDto } from './dto/create-vista.dto';
import { UpdateVistaDto } from './dto/update-vista.dto';
import { tipoStatus, TPayload, TRespuesta } from '../common/apiResponse';
import { handleError } from 'src/helpers/handleResponseApi';

@UseGuards(JwtAuthGuard)
@Controller('vistas')
export class VistasController {
  constructor(
    private readonly vistasService: VistasService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}
  
  @Post()
  async crearVista(@Req() req:Request, @Body("metodo") metodo:string, @Body("data") createVistaDto: CreateVistaDto): Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.VISTA_CREAR && usuario.nivel < niveles.JEFES_AREA) {
      return this.vistasService.crearVista(createVistaDto).then(() => ({
        status: tipoStatus.SUCCESS,
        message: "Vista creada correctamente."
      })).catch((err) => handleError(this.logger, metodos.VISTA_CREAR, err));
    } else {
      throw new HttpException("Metodo incorrecto o nivel fuera de rango.", HttpStatus.UNAUTHORIZED);
    };    
  };

  @Get()
  async listarVistas(@Req() req:Request): Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (usuario.nivel < niveles.JEFES_AREA) {
      return this.vistasService.listarVistas().then((data) => {
        if (data) {
          return ({
            status: tipoStatus.SUCCESS,
            message: "Vistas obtenidas correctamente.",
            data
          })
        } else {
          return ({
            status: tipoStatus.WARN,
            message: "No se encontraron registros.",
            data: null
          })
        };
      }).catch((err) => handleError(this.logger, "listarVistas", err));
    } else {
      throw new HttpException("Metodo incorrecto o nivel fuera de rango.", HttpStatus.UNAUTHORIZED);
    }; 
  };

  @Put('/:id')
  async actualizarVista(@Req() req:Request, @Param('id') id: string, @Body("metodo") metodo:string, @Body("data") updateVistaDto: UpdateVistaDto): Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.VISTA_ACTUALIZAR && usuario.nivel < niveles.JEFES_AREA) {
      return this.vistasService.actualizarVista(id, updateVistaDto).then((data) => {
        if (data) {
          return ({
            status: tipoStatus.SUCCESS,
            message: "Vista actualizada correctamente.",
            data
          })
        } else {
          return ({
            status: tipoStatus.WARN,
            message: "No se encontraron registros con el id.",
            data: null
          })
        };
      }).catch((err) => handleError(this.logger, metodos.VISTA_ACTUALIZAR, err));
    } else {
      throw new HttpException("Metodo incorrecto o nivel fuera de rango.", HttpStatus.UNAUTHORIZED);
    };
  };

  @Delete('/:id')
  async borrarVista(@Req() req:Request, @Param('id') id: string, @Body("metodo") metodo:string): Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.VISTA_BORRAR && usuario.nivel < niveles.JEFES_AREA) {
      return this.vistasService.borrarVista(id).then((data) => {
        if (data) {
          return ({
            status: tipoStatus.SUCCESS,
            message: "Vista borrada correctamente.",
            data
          })
        } else {
          return ({
            status: tipoStatus.WARN,
            message: "No se encontraron registros con el id.",
            data: null
          })
        };
      }).catch((err) => handleError(this.logger, metodos.VISTA_BORRAR, err));
    } else {
      throw new HttpException("Metodo incorrecto o nivel fuera de rango.", HttpStatus.UNAUTHORIZED);
    };
  };
};
