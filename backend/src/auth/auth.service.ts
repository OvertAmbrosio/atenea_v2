import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isEmpty } from 'class-validator';

import { RedisService } from 'src/database/redis.service';
import { EmpleadosService } from 'src/api/empleados/empleados.service';
import { Empleado } from 'src/api/empleados/schema/empleado.schema';
import { TErrorsLogin, TPayload } from 'src/api/common/apiResponse';
import capitalizar from 'src/helpers/capitalizar';

@Injectable()
export class AuthService {
  constructor(
    private readonly empleadoService: EmpleadosService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService
  ) {}
  //funcion que continua la estrategia local y ayuda a personalizar los mensajes de validacion
  async validarUsuario(username: string, password: string): Promise<Empleado|TErrorsLogin> {
    if (isEmpty(username)) { 
      throw ({username: 'Se necesita el correo o carnet.'});
    } else if(isEmpty(password)) {
      throw ({password: 'Se necesita la contraseña.'});
    } else {
      return await this.empleadoService.buscarUsuario(password, username).then(async(empleado) => {
        if (!empleado) {
          throw ({ message: 'Credenciales incorrectos..'});
        } else {
          const session = await this.redisService.get(String(empleado._id));
          if(empleado.usuario.activo && !session) {
            return empleado
          } else if (session) {
            return await this.redisService.remove(String(empleado._id)).then(() => empleado);
            // throw ({message: 'Ya hay una sesión activa.'})
          } else {
            throw ({message: 'El usuario se encuentra inactivo'})
          }
        }
      }).catch((error) => {
        throw new InternalServerErrorException(error, error.message)
      })
    }
  };
  //funcion para generar el token y guardar la sesion del usuario
  public async login(empleado: Empleado):Promise<string> {
    const payload: TPayload = { 
      nombre: capitalizar(empleado.nombre), 
      _id: empleado._id,
      contrata: empleado.contrata._id,
      cargo: empleado.cargo._id,
      cargo_nombre: empleado.cargo.nombre,
      nivel: empleado.nivel,
      area: empleado.area._id,
      zonas: empleado.zonas && empleado.zonas.length > 0 ? empleado.zonas.map((e) => e._id) : [],
      nodos: empleado.zonas && empleado.zonas.length > 0 ? Array.prototype.concat.apply([], empleado.zonas.map((e) => e.nodos)) : [],
      imagen: empleado.usuario.imagen, 
      dia: Date.now()
    };
    //generar el token segun los datos dados
    const token = this.jwtService.sign(payload);
    //guardar el token en redis y enviar un mensaje de error/confirmacion
    return await this.redisService.set(String(empleado._id), token,  86400)
      .then(() => token);
  };
  //funcion para compara el token guardado en redis con el token que tiene el usuario
  public async session(token: string, id: string):Promise<Empleado> {
    return await this.redisService.get(String(id)).then((tokenUser) => {
      if (tokenUser && tokenUser === token) {
        return this.empleadoService.buscarVistas(id);
      } else {
        throw new HttpException('La sesión ha expirado.', HttpStatus.FORBIDDEN);
      }
    })
  };
  //funcion para cerrar sesión
  public async logout(token: string, id: string) {
    return await this.redisService.get(String(id)).then(async(tokenUser) => {
      if (tokenUser && tokenUser === token) {
        return await this.redisService.remove(String(id))
      } else {
        throw new HttpException('La sesión ha expirado.', HttpStatus.FORBIDDEN);
      }
    })
  };
}
