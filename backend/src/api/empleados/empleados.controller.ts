import { Controller, Get, Post, Body, Put, Param, UseGuards, Inject, Req, Query, HttpException, HttpStatus, Patch } from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { tipoStatus, TPatchData, TPayload, TRespuesta } from '../common/apiResponse';
import { handleError } from 'src/helpers/handleResponseApi';
import { niveles } from 'src/enums/enumsEmpleados';
import { metodos } from 'src/enums';

@UseGuards(JwtAuthGuard)
@Controller('empleados')
export class EmpleadosController {
  constructor(
    private readonly empleadosService: EmpleadosService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}
  //metodo para traer todo el personal dependiendo del cargo
  @Get()
  async listarEmpleados(@Query("metodo") metodo:string, @Req() req:Request): Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    switch (metodo) {
      case metodos.EMPLEADOS_TODO_ROOT: return await this.empleadosService.listarTodo().then((data) => ({
        status: tipoStatus.SUCCESS,
        message: "Todo ok.",
        data 
      })).catch((err) => handleError(this.logger, metodos.EMPLEADOS_TODO_ROOT, err));
      case metodos.PERFIL_USUARIO: return await this.empleadosService.perfilUsuario(usuario._id).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: 'Perfil obtenido correctamente.',
        data: data
      })).catch((err) => handleError(this.logger, metodos.PERFIL_USUARIO, err)); 
      case metodos.EMPLEADOS_LISTAR_TODO:
        if (usuario.nivel <= niveles.JEFES_PERSONAL) {
          return await this.empleadosService.listarPersonal(usuario.nivel).then((data) => ({
            status: tipoStatus.SUCCESS,
            message: 'Lista obtenida correctamente.',
            data: data
          })).catch((err) => handleError(this.logger, `${metodos.EMPLEADOS_LISTAR_TODO}(JEFES_PERSONAL)`, err));
        } else if(usuario.nivel === niveles.JEFES_MINI_PERSONAL){
          return await this.empleadosService.listarPersonalAsignado(usuario.contrata, "contrata", usuario.area, usuario.nivel).then((data) => ({
            status: tipoStatus.SUCCESS,
            message: 'Lista obtenida correctamente.',
            data: data
          })).catch((err) => handleError(this.logger, `${metodos.EMPLEADOS_LISTAR_TODO}(JEFES_MINI_PERSONAL)`, err));
        } else {
          return await this.empleadosService.listarPersonalAsignado(usuario._id, usuario.cargo_nombre, usuario.area).then((data) => ({
            status: tipoStatus.SUCCESS,
            message: 'Lista obtenida correctamente.',
            data: data
          })).catch((err) => handleError(this.logger, `${metodos.EMPLEADOS_LISTAR_TODO}(ASIGNADOS)`, err));
        };
      case metodos.EMPLEADOS_LISTAR_AUDITORES: return this.empleadosService.listarAuditores(usuario.zonas).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: 'Auditores obtenidos correctamente.',
        data: data
      })).catch((err) => handleError(this.logger, metodos.EMPLEADOS_LISTAR_AUDITORES, err));
      case metodos.EMPLEADOS_LISTAR_SUPERVISORES: return this.empleadosService.listarSupervisores(usuario.nivel, usuario.zonas, usuario.area).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: 'Tecnicos obtenidos correctamente.',
        data
      })).catch((err) => handleError(this.logger, metodos.EMPLEADOS_LISTAR_SUPERVISORES, err));
      case metodos.EMPLEADOS_LISTAR_GESTORES: return this.empleadosService.listarGestores(usuario.nivel, usuario.zonas, usuario.area).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: 'Gestores obtenidos correctamente.',
        data
      })).catch((err) => handleError(this.logger, metodos.EMPLEADOS_LISTAR_GESTORES, err));
      case metodos.EMPLEADOS_LISTAR_TECNICOS:
        if (usuario.nivel < niveles.ASIGNADOS) {
          return this.empleadosService.listarTecnicosGlobal(usuario.nivel, usuario.area, usuario.zonas).then((data) => ({
            status: tipoStatus.SUCCESS,
            message: 'Tecnicos obtenidos correctamente.',
            data
          })).catch((err) => handleError(this.logger, metodos.EMPLEADOS_LISTAR_TECNICOS, err));
        } else {
          return this.empleadosService.listarTecnicosGestor(usuario._id).then((data) => ({
            status: tipoStatus.SUCCESS,
            message: 'Tecnicos obtenidos correctamente.',
            data
          })).catch((err) => handleError(this.logger, metodos.EMPLEADOS_LISTAR_TECNICOS, err));
        };
      case metodos.EMPLEADOS_LISTAR_APOYO: return this.empleadosService.listarTecnicosApoyo(usuario.nivel, usuario.area, usuario.zonas).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: 'Datos obtenidos correctamente.',
        data
      })).catch((err) => handleError(this.logger, metodos.EMPLEADOS_LISTAR_APOYO, err));
      case metodos.EMPLEADOS_LISTAR_COLUMNAS: return this.empleadosService.obtenerColumnasGestor(usuario._id).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: 'Configuración obtenida correctamente.',
        data
      })).catch((err) => handleError(this.logger, metodos.EMPLEADOS_LISTAR_COLUMNAS, err));
      case metodos.EMPLEADOS_LITAR_JEFES_CONTRATA: return this.empleadosService.listarJefeContrata(usuario.contrata).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: "Lista obtenida con exito.",
        data
      })).catch((err) => handleError(this.logger, metodos.EMPLEADOS_LITAR_JEFES_CONTRATA, err));
      default:
        throw new HttpException('Metodo incorrecto.', HttpStatus.FORBIDDEN);
    }
  };

  @Get('/:id')
  async buscarEmpleado(@Req() req:Request, @Query('metodo') metodo:string, @Param("id") id:string):Promise<TRespuesta> { 
    const usuario:TPayload = req.user;
    if (usuario.nivel < niveles.JEFES_MINI_PERSONAL && metodo === metodos.EMPLEADOS_BUSCAR_DETALLE) {
      return this.empleadosService.buscarDetalleEmpleado(id).then((data) => ({
        status: tipoStatus.SUCCESS,
        message: "Datos obtenidos correctamente.",
        data
      })).catch((err) => handleError(this.logger, metodos.EMPLEADOS_BUSCAR_DETALLE, err));
    } else {
      throw new HttpException("Metodo incorrecto.", HttpStatus.FORBIDDEN);
    };
  };

  @Post()
  async crearEmpleado(@Req() req:Request, @Body("metodo") metodo:string, @Body("empleado") createEmpleadoDto:CreateEmpleadoDto, @Body("email") email:string): Promise<TRespuesta> {
    const usuario:TPayload = req.user;

    if (createEmpleadoDto.nivel < niveles.JEFES_PERSONAL) {
      throw new HttpException('No puedes crear empleados con cargos mayores.', HttpStatus.FORBIDDEN);
    } else {
      if (usuario.nivel < niveles.JEFES_MINI_PERSONAL && metodo === metodos.EMPLEADOS_CREAR) {
        return await this.empleadosService.crearEmpleado(createEmpleadoDto, email).then((data) => {
          this.logger.info({message: `El usuario -${usuario.nombre}- ha creado un nuevo usuario (${data.nombre})`});
          return ({
            status: tipoStatus.SUCCESS,
            message: 'Usuario creado correctamente.'
          });
        }).catch((err) => handleError(this.logger, metodos.EMPLEADOS_CREAR, err)); 
      } else {
        throw new HttpException("No cuentas con los permisos necesarios.", HttpStatus.FORBIDDEN);
      };
    };
  };

  @Put('/:id')
  async editarEmpleado(
    @Req() req:Request,
    @Param('id') id:string, 
    @Body("metodo") metodo:string,
    @Body("empleado") updateEmpleadoDto:UpdateEmpleadoDto, 
    @Body("email") email:string
  ): Promise<TRespuesta> {
    const usuario:TPayload = req.user;
    if (id === usuario._id || (usuario.nivel < niveles.JEFES_MINI_PERSONAL && metodo === metodos.EMPLEADOS_ACTUALIZAR)) {
      return await this.empleadosService.actualizarEmpleado(id, usuario.nivel, updateEmpleadoDto, email).then((empleado) => {
        this.logger.info(`El usuario -${usuario.nombre}- ha actualizado al siguiente usuario -${empleado.nombre}-`);
        return ({
          status: 'success',
          message: 'Usuario actualizado correctamente.'
        })
      }).catch((err) => handleError(this.logger, "actualizarEmpleado", err));
    } else {
      throw new HttpException("No cuentas con los permisos necesarios.", HttpStatus.FORBIDDEN);
    };
  };
  //metodo que se encarga de la configuracion del usuario
  @Patch()
  async actualizarEmpleado(
    @Body() data: TPatchData,
    @Req() req: Request 
  ): Promise<TRespuesta> {
    const usuario:TPayload = req.user;

    if(data.id) this.logger.info({ message: `Usuario ${usuario.nombre} edita al usuario ${data.id} actualizarEmpleado(${data.metodo})`});
    //metodo para actualizar las columnas del gestor------------------------------------------------------------------
    if (data.metodo === metodos.EMPLEADOS_ACTUALIZAR_COLUMNAS) {
      return await this.empleadosService.actualizarColumnasGestor(usuario._id, data.columnas).then(() => {
        return ({status: tipoStatus.SUCCESS, message: 'Configuración guardada correctamente.'})
      }).catch((err) => handleError(this.logger, metodos.EMPLEADOS_ACTUALIZAR_COLUMNAS, err));
    //metodo para cambiar la contraseña desde el perfil del usuario---------------------------------------------------
    } else if (data.metodo === metodos.EMPLEADOS_CAMBIAR_PASS) {
      return await this.empleadosService.cambiarContraseña(usuario._id, data.password, data.newPassword1, data.newPassword2).then(() => {
        return ({status: tipoStatus.SUCCESS, message: 'Contraseña actualizada correctamente.'})
      }).catch((err) => handleError(this.logger, metodos.EMPLEADOS_CAMBIAR_PASS, err));
    //metodo para resetar la contraseña del empleado------------------------------------------------------------------
    } else if (data.metodo === metodos.EMPLEADOS_PASS_TOA) {
      return this.empleadosService.actualizarPassToa(usuario._id,data.passToa).then(() => ({
        status: tipoStatus.SUCCESS,
        message: "Contraseña actualizada correctamente."
      })).catch((err) => handleError(this.logger, metodos.EMPLEADOS_PASS_TOA, err));
    } else if (data.metodo === metodos.EMPLEADOS_RESET_PASS && usuario.nivel <= niveles.JEFES_MINI_PERSONAL) {
      return await this.empleadosService.resetPassword(data.id, usuario.nivel).then((e) => {
        this.logger.info({message: `usuario - ${usuario.nombre} - cambio el password de - ${e.nombre+' '+e.apellidos}`, service: metodos.EMPLEADOS_CAMBIAR_PASS});
        return ({status: tipoStatus.SUCCESS, message: 'Contraseña actualizada correctamente.'})
      }).catch((err) => handleError(this.logger, metodos.EMPLEADOS_CAMBIAR_PASS, err));
    //metodo para cerrar la sesión del usuario-------------------------------------------------------------------------
    } else if (data.metodo === metodos.EMPLEADOS_CERRAR_SESION && usuario.nivel <= niveles.JEFES_MINI_PERSONAL) {
      return this.empleadosService.cerrarSession(data.id).then(() => {
        this.logger.info({message: `usuario - ${usuario.nombre} - cerró la sesión de - ${data.id}`, service: metodos.EMPLEADOS_CERRAR_SESION})
        return ({status: tipoStatus.SUCCESS, message: 'Sesión cerrada correctamente.'});
      }).catch((err) => handleError(this.logger, metodos.EMPLEADOS_CERRAR_SESION, err));
    //metodo para actualizar los permisos del usuario-------------------------------------------------------------------
    } else if (data.metodo === metodos.EMPLEADOS_ACTUALIZAR_PERMISOS && usuario.nivel < niveles.JEFES_MINI_PERSONAL) {
      return this.empleadosService.actualizarPermisos(data.id, usuario.area, usuario.nivel, data.cargo, data.tipo).then(() => {
        return ({status: tipoStatus.SUCCESS, message: 'Cargo actualizado correctamente.'})
      }).catch((err) => handleError(this.logger, metodos.EMPLEADOS_ACTUALIZAR_PERMISOS, err));
    //metodo para activar la cuenta en caso se haya desactivado---------------------------------------------------------
    } else if (data.metodo === metodos.EMPLEADOS_ACTIVAR_CUENTA && usuario.nivel < niveles.JEFES_MINI_PERSONAL) {
      return this.empleadosService.activarCuenta(data.id, data.nivel).then(() => {
        return ({status: tipoStatus.SUCCESS, message: 'Cuenta activada correctamente.'})
      }).catch((err) => handleError(this.logger, metodos.EMPLEADOS_ACTIVAR_CUENTA, err));
    //metodo para editar el estado de lusuario dentro de la empresa-----------------------------------------------------
    } else if (data.metodo === metodos.EMPLEADOS_EDITAR_ESTADO_EMPRESA && usuario.nivel < niveles.JEFES_MINI_PERSONAL) {
      return this.empleadosService.editarEstadoEmpresa(data.id, usuario.nivel, data.estado_empresa, data.fecha_baja).then((e) => {
        this.logger.info({ message: `usuario -${usuario.nombre}- editó el estado del usuario -${e.nombre}-`})
        return ({
          status: tipoStatus.SUCCESS,
          message: 'Usuario actualizado correctamente.'
        })
      }).catch((err) => handleError(this.logger, metodos.EMPLEADOS_EDITAR_ESTADO_EMPRESA, err));
    //metodo para actualizar las rutas y asignar el supervisor del empleado------------------------------------------------
    } else if (data.metodo === metodos.EMPLEADOS_ACTUALIZAR_RUTA && usuario.nivel <= niveles.JEFES_MINI_PERSONAL) {
      return this.empleadosService.actualizarRuta(data.tecnicos, data.auditor, data.supervisor, data.gestor, data.tecnico, data.negocio, data.subNegocio).then(() => {
        this.logger.info({ message: `usuario -${usuario.nombre}- asigno a los empleados`})
        return ({
          status: tipoStatus.SUCCESS,
          message: 'Tecnicos asignados correctamente.'
        })
      }).catch((err) => handleError(this.logger, metodos.EMPLEADOS_ACTUALIZAR_RUTA, err));
    //error ---------------------------------------------------------------------------------------------------------
    } else if (data.metodo === metodos.EMPLEADOS_AGREGAR_VISTAS && usuario.nivel < niveles.JEFES_AREA) {
      return await this.empleadosService.actualizarVista(data.empleados, data.vistas).then((e) => ({
        status: tipoStatus.SUCCESS,
        message: "Vistas agregadas al usuario."
      })).catch((err) => handleError(this.logger,metodos.EMPLEADOS_AGREGAR_VISTAS, err));
    } else {
      throw new HttpException('Metodo incorrecto o permisos insuficientes.', HttpStatus.FORBIDDEN);
    };
  };
};
