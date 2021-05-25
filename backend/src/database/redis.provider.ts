import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as redisIoAdapter from 'socket.io-redis';
import { variables } from 'src/config';

export class RedisIoAdapter extends IoAdapter {
  constructor(app:any, private readonly configService: ConfigService) {
    // Or simply get the ConfigService in here, since you have the `app` instance anyway
    super(app);
  } 
  
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    const redisAdapters = redisIoAdapter({ 
      host: this.configService.get(variables.redis_host), 
      port: this.configService.get(variables.redis_port),
      password: this.configService.get(variables.redis_pass)
    });
    
    server.adapter(redisAdapters);
    return server;
  }
}