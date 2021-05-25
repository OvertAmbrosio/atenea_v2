import { 
  Controller, Inject, UseGuards,
  Get, Post, Put, Patch, Query,
  Param, Body, Req, HttpException, HttpStatus
} from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { tipoStatus, TPayload, TRespuesta } from '../common/apiResponse';
import { metodos, niveles } from '../../enums';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ContratasService } from './contratas.service';
import { CreateContrataDto } from './dto/create-contrata.dto';
import { UpdateContrataDto } from './dto/update-contrata.dto';
import { handleError } from 'src/helpers/handleResponseApi';

@UseGuards(JwtAuthGuard)
@Controller('contratas')
export class ContratasController {
  constructor(
    private readonly contratasService: ContratasService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}
  //metodo para crear la contrata
  @Post()
  async crearContrata(@Req() req:Request, @Body("metodo") metodo:string, @Body("contrata") createContrataDto: CreateContrataDto): Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.CONTRATA_CREAR && usuario.nivel <= niveles.JEFES_AREA) {
      return this.contratasService.crearContrata(createContrataDto).then(() => ({
          status: tipoStatus.SUCCESS,
          message: 'Contrata creada correctamente.'
        })).catch((err) => {
          console.log(err);
          
          return handleError(this.logger, metodos.CONTRATA_CREAR, err)
        });
    } else {
      throw new HttpException('No dispones de los permisos necesarios.', HttpStatus.FORBIDDEN)
    };
  };
  //metodo para obtener las contratas
  @Get()
  async listarContrata(@Req() req: Request, @Query('metodo') metodo: string): Promise<TRespuesta> {
     const usuario:TPayload = req.user;
    if (metodo === metodos.CONTRATA_LISTAR_TODO && usuario.nivel <= niveles.JEFES_PERSONAL) {
      return await this.contratasService.listarTodo().then((data) => ({
        status: tipoStatus.SUCCESS,
        message: 'Lista obtenida correctamente.',
        data
      })).catch((err) => handleError(this.logger, metodos.CONTRATA_LISTAR_TODO, err));
    } else if (metodo === metodos.CONTRATA_LISTAR_NOMBRES){
      return await this.contratasService.listarNombres().then((data) => {
        if (data) {
          return ({
            status: tipoStatus.SUCCESS,
            message: 'Lista obtenida correctamente.',
            data
          })
        } else {
          return ({
            status: tipoStatus.WARN,
            message: 'No se encontraron registros.',
            data
          })
        };
      }).catch((err) => handleError(this.logger, metodos.CONTRATA_LISTAR_NOMBRES, err));
    } else {
      throw new HttpException('Metodo o cargo incorrecto.', HttpStatus.NOT_FOUND)
    }
  };
  //metodo para editar la contrata
  @Put('/:id')
  async actualizarContrata(
    @Req() req: Request,
    @Param("id") id: string, 
    @Body("metodo") metodo:string, 
    @Body("contrata") updateContrataDto: UpdateContrataDto
  ): Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.CONTRATA_EDITAR && usuario.nivel < niveles.JEFES_AREA) {
      return await this.contratasService.actualizarContrata(id, updateContrataDto).then(() => {
        return ({
          status: tipoStatus.SUCCESS,
          message: 'Contrata actualizada correctamente.'
        })
      }).catch((err) => handleError(this.logger, metodos.CONTRATA_EDITAR, err));
    } else {
      throw new HttpException('No dispones de los permisos necesarios.', HttpStatus.FORBIDDEN)
    };  
  };
  //metodo para dar de baja a la contrata
  @Patch('/:id')
  async modificarEstadoContrata(
    @Req() req: Request,
    @Param('id') id: string, 
    @Body("metodo") metodo:string, 
    @Body('activo') activo: boolean, 
    @Body('fecha_baja') fecha_baja: Date
  ): Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (metodo === metodos.CONTRATA_BAJA && usuario.nivel <= niveles.JEFES_AREA) {
      return await this.contratasService.modificarEstadoContrata(id, activo, fecha_baja).then((data) => {
        if (data) {
          this.logger.info(`usuario -${usuario.nombre}- ${activo?"acrtivó":"desactivó"} la contrata -${data.nombre}-`)
          return ({
            status: tipoStatus.SUCCESS,
            message: `Contrata ${activo ? "activada": "desactivada"} correctamente.`
          });
        } else {
          return ({
            status: tipoStatus.WARN,
            message: `No se encontraron registros con ese id.`
          })
        };
      }).catch((err) => handleError(this.logger, metodos.CONTRATA_BAJA, err));
    } else {
      this.logger.error(`usuario -${usuario._id}- intentó desactivar la contrata -${id}- (sin permisos)`)
      throw new HttpException('No dispones de los permisos necesarios.', HttpStatus.UNAUTHORIZED);
    };   
  };
}
