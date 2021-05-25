import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, Inject, Query, Patch, HttpException, HttpStatus } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Request } from 'express';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OrdenesService } from './ordenes.service';
import { UpdateOrdeneDto } from './dto/update-ordene.dto';
import { tipoStatus, TPayload, TRespuesta } from '../common/apiResponse';
import { metodos, niveles } from 'src/enums';
import { handleError } from 'src/helpers/handleResponseApi';
import { OrdenesGateway } from './ordenes.gateway';

type TPatchData = {
  readonly ordenes?: string[],
  readonly contrata?: string,
  readonly gestor?: string,
  readonly tecnico?: string,
  readonly carnet?: string,
  readonly observacion?: string,
}

@Controller('ordenes')
export class OrdenesController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly ordenesService: OrdenesService,
    private readonly ordenesGateway: OrdenesGateway
  ) {}

  @Post('/prueba')
  async prueba(@Body()data:any) {
    return await this.ordenesService.prueba(data).then((res) => ({
      status: tipoStatus.SUCCESS,
      message: "ok",
      data: res
    })).catch((err) =>handleError(this.logger, "prueba", err));
  };
  
  @Get('/actualizar')
  async actualizarToa() {
    return await this.ordenesGateway.enviarOrdenesPendientes()
      .then(async() => await this.ordenesGateway.enviarPendientesGestor())
      .then(() => ({ status: 1 }))
      .catch((err) => handleError(this.logger, "actualizarToa", err));
  };
  
  @Post()
  @UseGuards(JwtAuthGuard)
  async postOrdenes(
    @Req() req:Request,
    @Body('metodo') metodo:string, 
    @Body('ordenes') ordenes:any[]
  ): Promise<TRespuesta> {
    const user:TPayload = req.user;
    //metodo para subir las data del excel de cms
    if (metodo === metodos.ORDENES_SUBIR_DATA && user.nivel <= niveles.JEFES_MINI_PERSONAL) {
      return await this.ordenesService.subirData(ordenes, user._id).then((data) => {
        this.logger.info({ message: `Data subida - codigo: ${data.grupo_entrada}`, service: metodos.ORDENES_SUBIR_DATA })  
        return ({
          status: tipoStatus.SUCCESS,
          message: 'Ordenes subidas correctamente.',
          data: data
        })
      }).catch((err) => handleError(this.logger, metodos.ORDENES_SUBIR_DATA, err));
    } else if (metodo == metodos.ORDENES_COMPROBAR_INFANCIAS && user.nivel <= niveles.JEFES_MINI_PERSONAL) {
      return await this.ordenesService.comprobarInfancias(ordenes).then((data) => ({
        status: tipoStatus.SUCCESS,
        message:  `(${data.actualizados}) Infancias encontradas.`,
        data
      })).catch((err) => handleError(this.logger, metodos.ORDENES_COMPROBAR_INFANCIAS, err));
    } else {
      return ({
        status: tipoStatus.ERROR,
        message: 'Metodo incorrecto o permisos innecesarios.'
      });
    };
  };

  @Get()
  @UseGuards(JwtAuthGuard)
  async getOrdenes(
    @Req() req:Request, 
    @Query('metodo') metodo:string, 
    @Query('tipo') tipo:string, 
    @Query('bandeja') bandeja:number,
    @Query('nodos') nodos:string[],
    @Query('requerimiento') requerimiento:string,
    @Query('cliente') cliente:string,
    @Query('fechaInicio') fechaInicio:Date,
    @Query('fechaFin') fechaFin:Date,
    @Query('codigo') codigo:string,
    @Query('field') field:string,
    @Query('limite') limite:number
  ): Promise<TRespuesta> {
    const user:TPayload = req.user;
    if (metodo === metodos.ORDENES_OBTENER_PENDIENTES ) {
      return await this.ordenesService.obtenerOrdenesPendientes(tipo, nodos).then((res) => ({
        status: tipoStatus.SUCCESS,
        message: `(${res.length}) Ordenes encontradas.`,
        data: res
      })).catch((err) => handleError(this.logger,  metodos.ORDENES_OBTENER_PENDIENTES, err));
    } else if (metodo === metodos.ORDENES_OBTENER_LIQUIDADAS) {
      let gestor = user.nivel <= niveles.JEFES_MINI_PERSONAL ? null : user._id;
      return await this.ordenesService.obtenerOrdenesLiquidadas(user.nodos, gestor, tipo, fechaInicio, fechaFin).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: `(${data.length}) Ordenes encontradas.`,
        data
      })).catch((err) => handleError(this.logger, metodos.ORDENES_OBTENER_LIQUIDADAS, err));
    } else if (metodo === metodos.ORDENES_OBTENER_OTRAS_BANDEJAS && user.nivel <= niveles.JEFES_MINI_PERSONAL) {
      return await this.ordenesService.obtenerOrdenesOtrasBandejas(tipo, bandeja).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: `(${data.length}) Ordenes encontradas.`,
        data
      })).catch((err) => handleError(this.logger, metodos.ORDENES_OBTENER_OTRAS_BANDEJAS, err));
    } else if (metodo === metodos.ORDENES_OBTENER_ANULADAS && user.nivel <= niveles.JEFES_MINI_PERSONAL) {
      return await this.ordenesService.obtenerOrdenesAnuladas(tipo).then((res) => {
        return ({
          status: tipoStatus.SUCCESS,
          message: `(${res.length}) Ordenes encontradas.`,
          data: res
        });
      }).catch((err) => handleError(this.logger,  metodos.ORDENES_OBTENER_ANULADAS, err));
    } else if (metodo === metodos.ORDENES_OBTENER_REITERADAS) {
      return await this.ordenesService.obtenerOrdenesReiteradas(cliente).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: `(${data.length}) Ordenes de reitero encontradas.`,
        data
      })).catch((err) => handleError(this.logger, metodos.ORDENES_OBTENER_REITERADAS, err));
    } else if (metodo === metodos.ORDENES_OBTENER_INFANCIA) {
      return await this.ordenesService.obtenerInfancia(requerimiento).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: `Infancia encontrada correctamente.`,
        data
      })).catch((err) => handleError(this.logger, metodos.ORDENES_OBTENER_INFANCIA, err));
    } else if (metodo === metodos.ORDENES_BUSCAR_REGISTRO) {
      return await this.ordenesService.obtenerRegistrosOrden(requerimiento).then((res) => {
        return ({
          status: tipoStatus.SUCCESS,
          message: `Registros encontrados correctamente.`,
          data: res
        });
      }).catch((err) => handleError(this.logger,  metodos.ORDENES_BUSCAR_REGISTRO, err));
    } else if (metodo === metodos.ORDENES_BUSCAR_DETALLE) {
      return await this.ordenesService.obtenerDetalleOrden(requerimiento).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: "Orden encontrada.",
        data
      })).catch((err) => handleError(this.logger, metodos.ORDENES_BUSCAR_DETALLE, err))
    } else if (metodo === metodos.ORDENES_BUSCAR_ORDEN) {
      return await this.ordenesService.buscarOrden(codigo, field, limite).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: "Datos encontrados.",
        data
      })).catch((err) => handleError(this.logger, metodos.ORDENES_BUSCAR_ORDEN, err))
    } else {
      this.logger.error({message: `Usuario: ${user.nombre} - intentó acceder con metodo incorrecto.`, service: 'getOrdenes'});
      return({ status: tipoStatus.ERROR, message: 'Metodo incorrecto o permisos insuficientes.' });
    }; 
  };

  @Get('/indicadores')
  @UseGuards(JwtAuthGuard)
  async getOrdenesRedis(
    // @Req() req:Request, 
    @Query('metodo') metodo:string, 
    @Query('zona') zona:string,
    @Query('negocio') negocio:string
  ):Promise<TRespuesta> {
    if (metodo === metodos.ORDENES_INDICADORES) {
      return await this.ordenesService.listarOrdenesRedis(zona, negocio).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: "Datos obtenidos correctamente.",
        data
      })).catch((err) => handleError(this.logger, metodos.ORDENES_INDICADORES, err));
    } else {
      throw new HttpException("Metodo incorrecto.", HttpStatus.BAD_REQUEST);
    }
  };

  @Get('/exportar')
  @UseGuards(JwtAuthGuard)
  async getOrdenesExportar(
    @Req() req: Request,
    @Query('metodo') metodo:string,
    @Query('todo') todo:number,
    @Query('tipo') tipo:string,
    @Query('ordenes') ordenes:string[],
    @Query('nodos') nodos:string[],
  ): Promise<TRespuesta> {
    const usuario:TPayload = req.user; 
    if (metodo === metodos.ORDENES_OBTENER_P_EXPORTAR) {
      if (usuario.nivel < niveles.ASIGNADOS) {
        return await this.ordenesService.obtenerPendientesExportar(todo, tipo, nodos, ordenes).then((data) => ({
          status: tipoStatus.SUCCESS,
          message: "Ordenes obtenidas correctamente.",
          data
        })).catch((err) => handleError(this.logger, metodos.ORDENES_OBTENER_P_EXPORTAR, err))
      } else {
        return await this.ordenesService.obtenerPendientesExportarGestor(usuario._id, ordenes, todo).then((data) => ({
          status: tipoStatus.SUCCESS,
          message: "Ordenes obtenidas correctamente.",
          data
        })).catch((err) => handleError(this.logger, metodos.ORDENES_OBTENER_P_EXPORTAR, err))
      };     
    } else {
      return({ status: tipoStatus.ERROR, message: 'Metodo incorrecto.' });
    }
  };
  
  @Patch()
  @UseGuards(JwtAuthGuard)
  async actualizarOrdenes(@Req() req:Request, @Body('metodo') metodo:string, @Body('data') data:TPatchData):Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.ORDENES_ASIGNAR) {
      return await this.ordenesService.asignarOrden(data.ordenes, usuario._id, data.contrata, data.gestor, data.tecnico, data.carnet, data.observacion).then((mensaje) => {
        this.actualizarToa()
        return ({
          status: tipoStatus.SUCCESS,
          message: mensaje,
          data
        })
      }).catch((err) => handleError(this.logger, metodos.ORDENES_ASIGNAR, err));
    } else {
      throw new HttpException("Metodo incorrecto.", HttpStatus.BAD_REQUEST);
    };
  };

  @Put()
  @UseGuards(JwtAuthGuard)
  async editarOrdenes(@Req() req:Request, @Body('metodo') metodo:string, @Body('ordenes') updateOrdeneDto:UpdateOrdeneDto[]): Promise<TRespuesta> {
    const user:TPayload = req.user; 
    if (metodo === metodos.ORDENES_ACTUALIZAR_LIQUIDADAS && user.nivel <= niveles.JEFES_MINI_PERSONAL) {
      return await this.ordenesService.liquidarOrdenes(updateOrdeneDto, user._id).then((data) => {
        return ({
          status: tipoStatus.SUCCESS,
          message: `(${data.actualizados}) Ordenes actualizadas.`,
          data
        })
      }).catch((err) => handleError(this.logger, metodos.ORDENES_ACTUALIZAR_LIQUIDADAS, err));
    } else {
      this.logger.error({message: `Usuario: ${user.nombre} - intentó acceder sin permisos.`, service: metodos.ORDENES_ACTUALIZAR_LIQUIDADAS});
      return({
        status: 'error',
        message: 'Metodo incorrecto o permisos insuficientes.'
      });
    }
  };
  
};
