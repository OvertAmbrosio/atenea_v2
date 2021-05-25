import { 
  Controller, Req,
  Post, Get, Headers, UseGuards, 
  Inject } from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { Empleado } from 'src/api/empleados/schema/empleado.schema';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { handleError } from 'src/helpers/handleResponseApi';
import { tipoStatus, TPayload, TRespuesta } from 'src/api/common/apiResponse';
import capitalizar from 'src/helpers/capitalizar';

@Controller('private/auth')
export class AuthController {
  constructor( 
    private readonly authService: AuthService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  //luego de pasar por la estrategia se realiza el logeo obteniendo el empleado como respuesta
  async login(@Req() req: Request): Promise<TRespuesta> {
    const empleado: Empleado|any = req.user;
    if (empleado) {
      return this.authService.login(empleado).then((token) => {
        if (token) {
          return ({
            status: tipoStatus.SUCCESS,
            message: "Has iniciado sesión.",
            data: token
          })
        } else {
          return ({
            status: tipoStatus.ERROR,
            message: "Error guardando el token de acceso.",
            data: null
          })
        };
      }).catch((err) => handleError(this.logger, "loginControlador", err));
    } else {
      return ({
        status: tipoStatus.ERROR,
        message: "Acceso Denegado.",
        data: null
      });
    }
  };
  //verificar la sesion del usuario
  @UseGuards(JwtAuthGuard)
  @Get('/session')
  async session(@Headers('authorization') token: string, @Req() req: Request): Promise<TRespuesta> {
    if (!token) {
      return ({status: 'error', message: 'No se encontró el token de acceso.', data: null})
    } else {
      const usuario:TPayload = req.user;
      const tokenBearer:string = String(token).substr(7, token.length);

      return await this.authService.session(tokenBearer, usuario._id).then((data) => {
        if (data) {
          return ({
            status: tipoStatus.SUCCESS,
            message: `Sesión verificada. Bienvenid@ ${capitalizar(data.nombre)}.`,
            data
          });
        } else {
          return ({
            status: tipoStatus.ERROR,
            message: 'Error verificando la sesión.',
            data: null
          });
        }
      }).catch((err) => handleError(this.logger, "sessionControlador", err));
    }
  };
  //cerrar sesion del usuario
  @UseGuards(JwtAuthGuard)
  @Get('/logout')
  async logout(@Headers('authorization') token: string, @Req() req: Request): Promise<TRespuesta> {
    if (!token) {
      return ({status: 'error', message: 'No se encontró el token de acceso.', data:null})
    } else {      
      const usuario:TPayload = req.user;
      const tokenBearer:string = String(token).substr(7, token.length);
      return await this.authService.logout(tokenBearer, usuario._id).then(() => {
        return ({
          status: 'success',
          message: 'Sesión cerrada correctamente.'
        });
      }).catch((err) => handleError(this.logger, "logoutController", err));;
    }
  };
};