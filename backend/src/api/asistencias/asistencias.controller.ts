import { Controller, Get, Post, Body, UseGuards, Req, HttpException, Inject, HttpStatus, Query, Patch } from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { metodos } from 'src/enums';
import { tipoStatus, TPayload, TRespuesta } from '../common/apiResponse';
import { AsistenciasService } from './asistencias.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { handleError } from 'src/helpers/handleResponseApi';

@UseGuards(JwtAuthGuard)
@Controller('asistencias')
export class AsistenciasController {
  constructor(
    private readonly asistenciasService: AsistenciasService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  @Post()
  async crearAsistencia(@Req() req:Request, @Body("metodo") metodo:string, @Body("asistencia") createAsistenciaDto:CreateAsistenciaDto):Promise<TRespuesta> {
    const usuario:TPayload = req.user;

    if (metodo === metodos.ASISTENCIA_CREAR) {
      return await this.asistenciasService.crearAsistencia(usuario._id, usuario.nombre, usuario.nivel, createAsistenciaDto).then(() => ({
        status: tipoStatus.SUCCESS,
        message: "Asistencia creada correctamente."
      })).catch((err) => handleError(this.logger, metodos.ASISTENCIA_CREAR, err));
    } else {
      throw new HttpException('Metodo incorrecto.', HttpStatus.FORBIDDEN);
    };    
  };

  @Get()
  async listarAsistencias(
    @Req() req:Request, 
    @Query("metodo") metodo:string,
    @Query("fechaInicio") fechaInicio:string, 
    @Query("fechaFin") fechaFin:string,
    @Query("cargo") cargo:string
  ):Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.ASISTENCIA_LISTAR_TODO) {
      return await this.asistenciasService.listarTodoAsistencia(usuario.nivel, usuario.area, usuario.zonas, usuario._id, fechaInicio, fechaFin, cargo).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: "Asistencia listada correctamente.",
        data
      })).catch((err) => handleError(this.logger, "listarAsistencia", err));
    } else if (metodo === metodos.ASISTENCIA_LISTAR_EFECTIVAS) {
      return await this.asistenciasService.listarAsistenciaEfectiva().then((data) => ({
        status: tipoStatus.SUCCESS,
        message: "Asistencia listada correctamente.",
        data
      })).catch((err) => handleError(this.logger, metodos.ASISTENCIA_LISTAR_EFECTIVAS, err));
    } else if (metodo === metodos.ASISTENCIA_LISTAR_SUPERVISOR ) {
      return await this.asistenciasService.listarAsistenciaSupervisor(usuario._id, usuario.area, usuario.nivel).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: "Asistencia listada correctamente.",
        data
      })).catch((err) => handleError(this.logger, metodos.ASISTENCIA_LISTAR_SUPERVISOR, err));
    } else {
      throw new HttpException("Metodo incorrecto.", HttpStatus.BAD_REQUEST);
    };    
  };

  @Patch()
  async actualizarAsistencia(
    @Req() req:Request, 
    @Body("metodo") metodo:string,
    @Body("asistencia") data: any
  ):Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.ASISTENCIA_ACTUALIZAR) {
      return await this.asistenciasService.actualizarAsistencia(usuario._id, usuario.nombre, usuario.nivel, data._id, data.estado, data.observacion, data.app ).then(() => ({
        status: tipoStatus.SUCCESS,
        message: "Asistencia actualizada correctamente."
      })).catch((err) => handleError(this.logger, metodos.ASISTENCIA_ACTUALIZAR, err))
    } else if (metodo === metodos.ASISTENCIA_ACTUALIZAR_IMAGEN) {
      return await this.asistenciasService.actualizarFotoRegistro(usuario._id, data.imagen, data.observacion).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: "Registro Actualizado correctamente.",
        data
      })).catch((err) => handleError(this.logger, metodos.ASISTENCIA_ACTUALIZAR_IMAGEN, err))
    } else {
      throw new HttpException("Metodo incorrecto", HttpStatus.BAD_REQUEST);
    }
  };
  
};
