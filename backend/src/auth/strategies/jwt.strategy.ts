import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { variables } from 'src/config';
import { RedisService } from 'src/database/redis.service';
import { TPayload } from 'src/api/common/apiResponse';

//esta clase sirve para validar que el usuario tenga una sesion activa
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private redisService: RedisService,
    private configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(variables.secret_jwt),
    });
  }
  //el token es decodificado y llega como parametro el payload 
  async validate(payload: TPayload) {
    return await this.redisService.get(String(payload._id)).then((token) => {      
      if (!token) {
        throw new HttpException("Sesión inválida", HttpStatus.FORBIDDEN)
      } else {
        return payload;
      }
    });    
  };
};