import { Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { OrdenesService } from './ordenes.service';
import { ZonasService } from '../zonas/zonas.service';
import { RedisService } from 'src/database/redis.service';
import { Ordene } from './schema/ordene.schema';
import { metodos } from 'src/enums';
import { tipoStatus, TPayload } from '../common/apiResponse';

type TDataUpdate = {
  usuario?: TPayload,
  tipo?: string,
  ordenes?: string[],
  tecnico?: string,
  carnet?: string,
  gestor?: string,
  contrata?: string,
  fechaCita?: Date,
  estado?: string,
  observacion?: string
}

@WebSocketGateway()
export class OrdenesGateway {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly ordenesService: OrdenesService,
    private readonly zonasService: ZonasService,
    private readonly redisService: RedisService
  ) {}

  @WebSocketServer() private readonly server: Server;

  responderErrores(id:string, metodo:string, error:any) {
    console.log(error);
    this.logger.error({ message: error.message, service: metodo });
    if (id) {
      this.server.to(id).emit(metodos.CLIENTE_RECIBIR_MENSAJE, { 
        message: error.message,
        status: tipoStatus.ERROR 
      })
    };
  };

  //funcion para enviar las ordenes dependiendo del tipo ( averia / alta )
  async enviarOrdenesPendientes(tipo?:string, cliente?:string, zona?:string) {
    const listaZonas = await this.zonasService.listarZonas();
    return await this.ordenesService.obtenerOrdenesPendientes(tipo, null).then((ordenes) => {
      if (ordenes && listaZonas.length > 0) {
        if (cliente && zona) {
          ordenes.forEach((dataTipo:any) => {
            listaZonas.filter((e) => e._id === zona).forEach((zonaCliente) => {
              const data = dataTipo.data.filter((orden:Ordene) => zonaCliente.nodos.includes(orden.codigo_nodo));
              this.server.to(cliente).emit(metodos.ORDENES_SOCKET_PENDIENTES, { data })
            })
          })
        } else {
          ordenes.forEach((dataTipo:any) => {
            listaZonas.forEach((zona) => {
              const data = dataTipo.data.filter((orden:Ordene) => zona.nodos.includes(orden.codigo_nodo));
              this.server.to( `sala_${zona._id}_${dataTipo._id}`).emit(metodos.ORDENES_SOCKET_PENDIENTES, { data })
            })
          });
        };
      };
    }).catch((error) => this.responderErrores(null, "enviarOrdenesPendientes", error));   
  };

  async enviarPendientesGestor(gestor?:string) {
    return await this.ordenesService.obtenerOrdenesGestorPendientes(gestor).then((ordenes) => {
      if (ordenes.length > 0) {
        ordenes.filter((e) => e && e._id).forEach(async(dataGestor:any) => {
          const cliente:any = await this.redisService.get(`ID_${dataGestor._id}`);
          if (cliente) {
            this.server.to(cliente).emit(metodos.ORDENES_SOCKET_PENDIENTES, { data: dataGestor.data });
          }
        });
      } else {
        return;
      };
    }).catch((error) => this.responderErrores(null, "enviarPendientesGestor", error));
  };

  async guardarRedis(cliente:string,usuario:any) {
    const string = JSON.stringify({id: usuario.id, nombre: usuario.nombre});
    return await this.redisService.set(`ID_${usuario.id}`, cliente, 86400).then(async() => 
      await this.redisService.set(`CLIENT_${cliente}`, string, 3600)
    );
  };

  @SubscribeMessage(metodos.REGISTRAR_CLIENTE)
  async registrarCliente(client:Socket, data: any) {
    console.log("Cliente Registrado.", client.id, data);
    return await this.guardarRedis(client.id, data).then(() => {
      this.server.emit("mensajeParaAdministradores", { mensaje: `Usuario conectado: ${data.nombre}`, id: data.id});
      return client
    });
    
  };

  @SubscribeMessage(metodos.UNIR_SALA_PENDIENTES)
  async registrarSalaPendientes(client:Socket, data:{zona:string, tipo:string}) {
    console.log("Conectado a sala: ", data);
    
    try {
      client.join(`sala_${data.zona}_${data.tipo}`);
      client.join(client.id)
      await this.enviarOrdenesPendientes(data.tipo, client.id, data.zona);
      return true;
    } catch (error) {
      console.log(error);
      return this.responderErrores(client.id, metodos.ORDENES_SOCKET_OBSERVACION, error)
    };    
  };

  @SubscribeMessage(metodos.DEJAR_SALA_PENDIENTES)
  async dejarSalaPendientes(client:Socket) {
    try {
      console.log("Cliente Desconectado Zona: ");
      client.leaveAll();
    } catch (error) {
      console.log(error);
      return this.responderErrores(client.id, metodos.ORDENES_SOCKET_OBSERVACION, error)
    };    
  };

  @SubscribeMessage(metodos.UNIR_SALA_GESTOR_PENDIENTES)
  async registrarSalaGestorPendientes(@ConnectedSocket() client:Socket, @MessageBody() data:TPayload) {
    const idUsuario:any = await this.redisService.get(`CLIENT_${client.id}`);
    console.log(idUsuario, client.id);
    return await this.ordenesService.obtenerOrdenesGestorPendientes().then(async(ordenes) => {
      if (idUsuario) {
        const usuarioJson = JSON.parse(idUsuario);
        ordenes.filter((e) => e && e._id === usuarioJson.id).forEach(async(dataGestor:any) => {          
          this.server.to(client.id).emit(metodos.ORDENES_SOCKET_PENDIENTES, { data: dataGestor.data });
        });
        return this.server.to(client.id).emit(metodos.CLIENTE_RECIBIR_MENSAJE, { 
          message: "Sincronizado con el servidor.", 
          status: tipoStatus.SUCCESS 
        })
      } else {
        if (data && data._id) {
          return await this.guardarRedis(client.id, { id: data._id, nombre: data.nombre });
        } else {
          return this.responderErrores(client.id, "enviarOrdenesPendientesGestor", {message: "No se encontró el usuario."});
        };
      };
    }).catch((error) => this.responderErrores(client.id, metodos.ORDENES_SOCKET_ASIGNAR, error));
  };

  @SubscribeMessage(metodos.ORDENES_SOCKET_OBSERVACION)
  async actualizarObservacion(@ConnectedSocket() client:Socket, @MessageBody() data:TDataUpdate) {
    try {
      return await this.ordenesService.agregarObservacion(data.usuario._id, data.ordenes, data.observacion).then(async() => {
        await this.enviarPendientesGestor(data.usuario._id);
        await this.enviarOrdenesPendientes(data.tipo);
        this.server.to(client.id).emit(metodos.CLIENTE_RECIBIR_MENSAJE, { 
          message: "Observacion agregada correctamente.",
          status: tipoStatus.SUCCESS 
        })
      }).catch((error) => this.responderErrores(client.id, metodos.ORDENES_SOCKET_ASIGNAR, error));
    } catch (error) {
      return this.responderErrores(client.id, metodos.ORDENES_SOCKET_OBSERVACION, error)
    };
  };

  @SubscribeMessage(metodos.ORDENES_SOCKET_AGENDAR)
  async agendarOrden(@ConnectedSocket() client:Socket, @MessageBody() data:TDataUpdate){
    try {
      return await this.ordenesService.agendarOrden(data.ordenes, data.usuario._id, data.gestor, data.tecnico, data.fechaCita).then(async() => {
        await this.enviarPendientesGestor(data.usuario._id);
        await this.enviarOrdenesPendientes(data.tipo);
        this.server.to(client.id).emit(metodos.CLIENTE_RECIBIR_MENSAJE, { 
          message: "Orden agendada correctamente.",
          status: tipoStatus.SUCCESS 
        })
      }).catch((error) => this.responderErrores(client.id, metodos.ORDENES_SOCKET_ASIGNAR, error));
    } catch (error) {
      return this.responderErrores(client.id, metodos.ORDENES_SOCKET_AGENDAR, error)
    };
  };

  // @SubscribeMessage(metodos.ORDENES_SOCKET_ASIGNAR)
  // async asignarOrden(@ConnectedSocket() client:Socket, @MessageBody() data:TDataUpdate) {
  //   try {
  //     return await this.ordenesService.asignarOrden(data.ordenes, data.usuario._id, data.contrata, data.gestor, data.tecnico, data.carnet, data.observacion).then(async(mensaje) => {
  //       await this.enviarPendientesGestor(data.usuario._id);
  //       await this.enviarOrdenesPendientes(data.tipo);
  //       if (data.gestor) {
  //         const usuario:any = await this.redisService.get(`ID_${data.gestor}`)
  //         if (usuario) {
  //           await this.enviarPendientesGestor(data.gestor);
  //           this.server.to(usuario).emit(metodos.CLIENTE_RECIBIR_MENSAJE, { 
  //             message: `Se asignó (${data.ordenes.length}) ordenes nuevas.`,
  //             status: tipoStatus.SUCCESS 
  //           })
  //         }
  //       };
  //       this.server.to(client.id).emit(metodos.CLIENTE_RECIBIR_MENSAJE, { 
  //         message: mensaje,
  //         status: tipoStatus.SUCCESS 
  //       })
  //     }).catch((error) => this.responderErrores(client.id, metodos.ORDENES_SOCKET_ASIGNAR, error));
  //   } catch (error) {
  //     return this.responderErrores(client.id, metodos.ORDENES_SOCKET_ASIGNAR, error)
  //   }
  // };

  @SubscribeMessage(metodos.ORDENES_SOCKET_ESTADO)
  async actualizarEstado(@ConnectedSocket() client:Socket, @MessageBody() data:TDataUpdate){
    try {
      return await this.ordenesService.actualizarEstadoOrden(data.usuario._id, data.ordenes, data.observacion, data.estado).then(async() => {
        await this.enviarPendientesGestor(data.usuario._id);
        await this.enviarOrdenesPendientes(data.tipo);
        this.server.to(client.id).emit(metodos.CLIENTE_RECIBIR_MENSAJE, { 
          message: "Orden actualizada correctamente.",
          status: tipoStatus.SUCCESS 
        })
      }).catch((error) => this.responderErrores(client.id, metodos.ORDENES_SOCKET_ESTADO, error));
    } catch (error) {
      return this.responderErrores(client.id, metodos.ORDENES_SOCKET_ESTADO, error)
    };
  };

  public async handleDisconnect(client: Socket) {
    try {
      client.leaveAll();
      const idUsuario:any = await this.redisService.get(`CLIENT_${client.id}`);
      if (idUsuario) {
        const idSocket = await this.redisService.get(`ID_${JSON.parse(idUsuario).id}`);
        if (idSocket) { 
          this.server.emit("mensajeParaAdministradores", { 
            mensaje: `Usuario desconectado: ${JSON.parse(idUsuario).nombre}`, 
            id: JSON.parse(idUsuario).id
          });
        }
        await this.redisService.remove(`ID_${JSON.parse(idUsuario).id}`);
      }
      await this.redisService.remove(`CLIENT_${client.id}`);
    } catch (error) {
      console.log(error);
    };
    console.log(`Client desconnected: ${client.id}`);
    return client.id;
  };

  public handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    return client
  };
}
