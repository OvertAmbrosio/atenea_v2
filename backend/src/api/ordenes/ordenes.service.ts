import { HttpException, HttpService, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types,  } from 'mongoose';
import { DateTime } from 'luxon';

import { bandejasLiteyca, bandejasRC, estadoGestor, tiposOrden, tiposLiquidacion, estadosToa } from 'src/enums';
import { CreateOrdeneDto } from './dto/create-ordene.dto';
import { UpdateOrdeneDto } from './dto/update-ordene.dto';
import { HistorialRegistro } from './schema/historial.schema';
import { Ordene, OrdeneDocument } from './schema/ordene.schema';
import { ZonasService } from '../zonas/zonas.service';
import { EmpleadosService } from '../empleados/empleados.service';
import { RedisService } from 'src/database/redis.service';
import { redisKeys } from 'src/config/redisKeys';
import { TOrdenesToa } from '../common/ordenesTypes';

@Injectable()
export class OrdenesService {
  constructor(
    @InjectModel('Ordene') private readonly ordenModel: Model<OrdeneDocument>,
    private readonly empleadoService: EmpleadosService,
    private readonly zonasService: ZonasService,
    private readonly redisService: RedisService,
    private readonly httpService: HttpService,
  ){}

  async prueba(data:{orden:string,id:any}[]) {
    return Promise.all(data.map(async(orden) => {
      return await this.ordenModel.findOneAndUpdate({codigo_requerimiento: orden.orden}, { gestor: orden.id })
    }));
  }; 
  //FUNCION PARA MANEJAR LOS CAMBIOS DE BANDEJAS
  private cambiarBandeja(antiguoCtr:number, nuevoCtr:number):{observacion:string, estado:string, service:string} {
    switch (Number(nuevoCtr)) {
      case bandejasLiteyca.PEX:
        return ({ 
          observacion: 'Orden movida a planta externa.', 
          estado: estadoGestor.PEXT, 
          service: "subirData(servicio - o.codigo_ctr === bandejas.PEX)"
        })
      case bandejasLiteyca.CRITICOS:
        return ({ 
          observacion: 'Orden movida a la bandeja criticos.', 
          estado: null, 
          service: 'subirData(servicio - o.codigo_ctr === bandejas.CRITICOS)'
        })
      case bandejasLiteyca.LITEYCA:
        return ({ 
          observacion: `Orden retorna a la bandeja Liteyca (${antiguoCtr} > ${nuevoCtr}).`, 
          estado: estadoGestor.PENDIENTE, 
          service: 'subirData(servicio - o.codigo_ctr === bandejas.LITEYCA)'
        })
      default:
        return ({ 
          observacion: `Orden movida a una bandeja externa (${antiguoCtr} > ${nuevoCtr}).`,
          estado: estadoGestor.PENDIENTE, 
          service: 'subirData(servicio - bandeja externa)'
        })
    }
  };
  //capturar la data del excel, validar si es alta o averia
    //AVERIA---
    //buscar la orden en la base de datos
    //--SI EXISTE
    //---comprobar la bandeja:
    //---bandejas iguales = no hacer nada
    //---bandejas diferentes actualizar 
    //----SI EX PLANTA EXTERNA: codigo_ctr, descripcion_ctr, observacion, estado_gestor=pex, 
    //----SI NO ES: codigo_ctr, descripcion_ctr, observacion,
    //--SI NO EXISTE
    //---buscar infancia
    //---guardar orden
    //ALTAS---
    //---guardar orden
  async subirData(createOrdenesDto:CreateOrdeneDto[], usuario:any) {
    //declarar variables a utilizar
    let actualizados = 0;
    const estadosLiquidados = [estadoGestor.LIQUIDADO,estadoGestor.ANULADO];
    const grupo_entrada = Date.now();
    const listaNodos = await this.zonasService.listarZonas()
      .then((zonas) => Array.prototype.concat.apply([], zonas.map((zona) => zona.nodos)));
    //realizar bucle para retornar bulkops
    return await Promise.all(createOrdenesDto.map(async(createOrden) => 
      await this.ordenModel.findOne({codigo_requerimiento: String(createOrden.codigo_requerimiento)})
        .then(async(ordenBase) => {
        if (createOrden.tipo === tiposOrden.AVERIAS) {
          if (ordenBase) {
            let historial_registro:Array<HistorialRegistro> = [];
            let objUpdate: Partial<Ordene> = {
              fecha_liquidado: null,
            };
            const baseFechaReg = DateTime.fromJSDate(ordenBase.fecha_registro);
            const nuevoFechaReg = DateTime.fromJSDate(new Date(createOrden.fecha_registro));
            if (nuevoFechaReg.isValid && baseFechaReg.toMillis() !== baseFechaReg.toMillis()) {
              // objUpdate.fecha_registro = createOrden.fecha_registro;
              const fechaRegistro = DateTime.fromJSDate(ordenBase.fecha_registro).toFormat("dd/MM HH:mm")
              const fechaRegistroNuevo = DateTime.fromJSDate(createOrden.fecha_registro).toFormat("dd/MM HH:mm")
              historial_registro.push({
                observacion: `Se detectó un cambio en la fecha de registro (CMS - ${fechaRegistro}>${fechaRegistroNuevo})`,
                usuario_entrada: usuario,
                fecha_entrada: new Date(),
                estado_orden: ordenBase.estado_gestor
              })
            };

            if(estadosLiquidados.includes(ordenBase.estado_gestor)) {
              //actualizar objeto update
              objUpdate["estado_gestor"] = estadoGestor.PENDIENTE;
              //agregar al istorial de cambios
              historial_registro.push({
                observacion: `Orden reinyectada. (${ordenBase.estado_gestor}>${estadoGestor.PENDIENTE})`,
                usuario_entrada: usuario,
                fecha_entrada: new Date(),
                estado_orden: estadoGestor.PENDIENTE
              })
            };

            if (listaNodos && listaNodos.includes(createOrden.codigo_nodo)) {
              if (Number(ordenBase.codigo_ctr) !== Number(createOrden.codigo_ctr)) {
                let cambioResponse = this.cambiarBandeja(ordenBase.codigo_ctr, createOrden.codigo_ctr );
                // acutalizar objeto update
                objUpdate["codigo_ctr"] = createOrden.codigo_ctr;
                objUpdate["descripcion_ctr"] = createOrden.descripcion_ctr;
                if(cambioResponse.estado) objUpdate['estado_gestor'] = cambioResponse.estado;
                if(createOrden.codigo_nodo) objUpdate["codigo_nodo"] = createOrden.codigo_nodo;
                //agregar historial de cambios
                historial_registro.push({
                  observacion: cambioResponse.observacion,
                  estado_orden: cambioResponse.estado ? cambioResponse.estado : ordenBase.estado_gestor,
                  usuario_entrada: usuario,
                  fecha_entrada: new Date(),
                  codigo_ctr: createOrden.codigo_ctr
                });
              } else if (ordenBase.codigo_nodo !== createOrden.codigo_nodo) {
                objUpdate["codigo_nodo"] = createOrden.codigo_nodo;
                //agregar historial de cambios
                historial_registro.push({
                  observacion: "se detecta un cambio de nodo.",
                  estado_orden: ordenBase.estado_gestor,
                  usuario_entrada: usuario,
                  fecha_entrada: new Date(),
                  codigo_ctr: createOrden.codigo_ctr
                });
              };
            } else {
              objUpdate["codigo_nodo"] = createOrden.codigo_nodo;
              objUpdate.codigo_ctr = createOrden.codigo_ctr;
              historial_registro.push({
                observacion: "Orden transferida a un nodo externo.",
                estado_orden: estadoGestor.PENDIENTE,
                usuario_entrada: usuario,
                fecha_entrada: new Date(),
                codigo_ctr: createOrden.codigo_ctr
              });
            };

            //agregar campos extras en caso no esten vacios
            if (createOrden.codigo_zonal) objUpdate.codigo_zonal = createOrden.codigo_zonal;
            if (createOrden.codigo_trabajo) objUpdate.codigo_trabajo = createOrden.codigo_trabajo;
            if (createOrden.descripcion_ctr) objUpdate.descripcion_ctr = createOrden.descripcion_ctr;
            if (createOrden.detalle_motivo) objUpdate.detalle_motivo = createOrden.detalle_motivo;
            if (createOrden.detalle_trabajo) objUpdate.detalle_trabajo = createOrden.detalle_trabajo;
            if (createOrden.numero_reiterada) objUpdate.numero_reiterada = createOrden.numero_reiterada;
            if (createOrden.telefono_contacto) objUpdate.telefono_contacto = createOrden.telefono_contacto;
            if (createOrden.telefono_referencia) objUpdate.telefono_referencia = createOrden.telefono_referencia;
            if (createOrden.tipo_requerimiento) objUpdate.tipo_requerimiento = createOrden.tipo_requerimiento;
            if (createOrden.tipo_tecnologia) objUpdate.tipo_tecnologia = createOrden.tipo_tecnologia;

            if (historial_registro.length > 0 ) {
              actualizados = actualizados+1
              return ({
                "updateOne": {
                  "filter": { "codigo_requerimiento": String(createOrden.codigo_requerimiento) },
                  "update": {
                    "$set": objUpdate,
                    "$push": { historial_registro: { "$each": historial_registro } }
                  },
                  "upsert": false
                }
              })
            } else {
              return ({
                "updateOne": {
                  "filter": { "codigo_requerimiento": String(createOrden.codigo_requerimiento) },
                  "update": {
                    "$set": objUpdate
                  },
                  "upsert": false
                }
              })
            };
          } else {
            if (listaNodos && listaNodos.includes(createOrden.codigo_nodo)) {
              const fechaInicio = DateTime.fromJSDate(new Date(createOrden.fecha_registro)).plus({month: -1});
              const fechaBusqueda = new Date(Date.UTC(fechaInicio.get('year'), fechaInicio.get('month')-1, fechaInicio.get('day'), 0, 0, 0));
              
              const infancia = await this.ordenModel.findOne({
                $and: [
                  { tipo: tiposOrden.ALTAS },
                  { codigo_cliente: createOrden.codigo_cliente },
                  { fecha_liquidado: { $gte: fechaBusqueda } },
                  { estado_gestor: estadoGestor.LIQUIDADO }
                ]
              }).select('_id');

              return ({
                "insertOne": {
                  "document": {
                    ...createOrden,
                    infancia: infancia && infancia._id ? infancia._id : null,
                    historial_registro: [{
                      usuario_entrada: usuario,
                      estado_orden: estadoGestor.PENDIENTE,
                      observacion: 'Ordenes exportadas desde cms.',
                      grupo_entrada,
                      codigo_ctr: createOrden.codigo_ctr
                    }]
                  }
                }
              });
            } else { return null}     
          };
        } else if (createOrden.tipo === tiposOrden.ALTAS) {
          if (ordenBase) {
            let historial_registro:Array<HistorialRegistro> = [];
            let objUpdate:Partial<Ordene> = {
              fecha_liquidado: null,
              fecha_asignado: createOrden.fecha_asignado && ordenBase.fecha_asignado !== createOrden.fecha_asignado 
                ? createOrden.fecha_asignado : ordenBase.fecha_asignado
            };
  
            if (createOrden.codigo_trabajo) objUpdate['codigo_trabajo'] = createOrden.codigo_trabajo;
            if (createOrden.codigo_peticion) objUpdate['codigo_peticion'] = createOrden.codigo_peticion;
            if (createOrden.indicador_pai) {
              if (String(createOrden.indicador_pai).toLowerCase() === 'pendiente' || String(createOrden.indicador_pai) === '1') {
                objUpdate.indicador_pai = '1';
                if (String(ordenBase.indicador_pai) === '0') {
                  objUpdate.estado_gestor === estadoGestor.OBSERVADO,
                  historial_registro.push({
                    observacion: `Orden observada en PAI`,
                    usuario_entrada: usuario,
                    fecha_entrada: new Date(),
                    estado_orden: estadoGestor.OBSERVADO
                  });
                }
              } else {
                objUpdate.indicador_pai = '0';
                if (createOrden.indicador_pai === '0' && createOrden.indicador_pai !== ordenBase.indicador_pai ) {
                  objUpdate.estado_gestor === estadoGestor.PENDIENTE;
                  historial_registro.push({
                    observacion: `Se levanta la observación PAI`,
                    usuario_entrada: usuario,
                    fecha_entrada: new Date(),
                    estado_orden: estadoGestor.PENDIENTE
                  })
                };
              }
            };
            if (createOrden.codigo_ctr && Number(createOrden.codigo_ctr) !== Number(ordenBase.codigo_ctr)) {
              objUpdate['codigo_ctr'] = createOrden.codigo_ctr;
              historial_registro.push({
                observacion: `Orden cambio de bandeja (${ordenBase.codigo_ctr}>${createOrden.codigo_ctr})`,
                usuario_entrada: usuario,
                fecha_entrada: new Date(),
                estado_orden: estadoGestor.PENDIENTE
              })
            } else {
              objUpdate['codigo_ctr'] = createOrden.codigo_ctr;
            }
            if (createOrden.codigo_nodo && String(createOrden.codigo_nodo) !== String(ordenBase.codigo_nodo)) {
              objUpdate['codigo_nodo'] = createOrden.codigo_nodo;
              historial_registro.push({
                observacion: `Orden cambió de nodo (${ordenBase.codigo_nodo}>${createOrden.codigo_nodo})`,
                usuario_entrada: usuario,
                fecha_entrada: new Date(),
                estado_orden: estadoGestor.PENDIENTE
              })
            }
            if (createOrden.tipo_tecnologia) objUpdate['tipo_tecnologia'] = createOrden.tipo_tecnologia;

            //agregar campos extras en caso no esten vacios
            if (createOrden.codigo_zonal) objUpdate.codigo_zonal = createOrden.codigo_zonal;
            if (createOrden.descripcion_ctr) objUpdate.descripcion_ctr = createOrden.descripcion_ctr;
            if (createOrden.detalle_motivo) objUpdate.detalle_motivo = createOrden.detalle_motivo;
            if (createOrden.detalle_trabajo) objUpdate.detalle_trabajo = createOrden.detalle_trabajo;
            if (createOrden.numero_reiterada) objUpdate.numero_reiterada = createOrden.numero_reiterada;
            if (createOrden.telefono_contacto) objUpdate.telefono_contacto = createOrden.telefono_contacto;
            if (createOrden.telefono_referencia) objUpdate.telefono_referencia = createOrden.telefono_referencia;
            if (createOrden.tipo_requerimiento) objUpdate.tipo_requerimiento = createOrden.tipo_requerimiento;

            if (historial_registro.length > 0) {
              return ({
                "updateOne": {
                  "filter": { "codigo_requerimiento": String(createOrden.codigo_requerimiento) },
                  "update": {
                    "$set": objUpdate,
                    "$push": { historial_registro: { "$each": historial_registro } }
                  },
                }
              })
            } else {
              return ({
                "updateOne": {
                  "filter": { "codigo_requerimiento": String(createOrden.codigo_requerimiento) },
                  "update": {
                    "$set": objUpdate,
                  },
                }
              })
            };
          } else {
            return ({
              "insertOne": {
                "document": { 
                  ...createOrden,
                  historial_registro: [{
                    usuario_entrada: usuario,
                    estado_orden: estadoGestor.PENDIENTE,
                    observacion: 'Ordenes exportadas desde cms.',
                    grupo_entrada,
                    codigo_ctr: createOrden.codigo_ctr
                  }]
                }
              }
            });
          };
        } else {return null}
      })
    )).then(async (data) => await this.ordenModel.bulkWrite(data.filter((e) => e), { ordered: false })
        .then((res) => res.result)
        .catch((err) => err.result)
     ).then((res) => ({
      total: res,
      nuevos: res.nInserted, 
      actualizados,
      duplicados: res.nModified,
      grupo_entrada
    }));     
  };
  // async comprobarInfancias2(ordenes:Array<{_id:string, cliente:string, fecha:Date}>) {
  //   this.ordenModel.collection.initializeOrderedBulkOp().find()
  // };
  //comprobar infancias 
  async comprobarInfancias(ordenes:Array<{codigo_requerimiento:string, cliente:string, fecha:Date}>) {
    const nodos = await this.zonasService.listarZonas().then((zonas) => zonas.length > 0 ? Array.prototype.concat.apply([], zonas.map((z) => z.nodos)) : []);
    return await Promise.all(ordenes.map(async (o) => {
      //obtener fecha_registro - 31 dias de garantia de la alta (la averia debe tener menos de 30 dias para pasar la garantia)
      const fechaInicio = DateTime.fromJSDate(new Date(o.fecha)).plus({month: -1}).set({ hour:0, minute:0, second:0, millisecond:0 });
      
      return await this.ordenModel.findOne({ 
        $and: [
          { tipo: tiposOrden.ALTAS },
          { codigo_nodo: { $in: nodos } },
          { codigo_cliente: o.cliente },
          { fecha_liquidado: { $gte: fechaInicio.toJSDate() } },
          { estado_gestor: estadoGestor.LIQUIDADO }
        ]
      }).select("_id").then(async(infanciaAlta) => {
        if (infanciaAlta) {
          
          return ({
            "updateOne": {
              "filter": { "codigo_requerimiento": o.codigo_requerimiento },
              "update": {
                "$set": { infancia: infanciaAlta._id}
              },
              "upsert": false
            }
          })
        } else {
          return false;
        }
      });
    })).then(async (data) => await this.ordenModel.bulkWrite(data.filter((e) => e), { ordered: false })
          .then((res) => res.result)
          .catch((err) => err.result)
      ).then((res) => ({
        total: res,
        actualizados: res.nModified
      }));
  };
  //subir la data de liquidadas
  //-BUSAR LA ORDEN FILTRANDO QUE NO HAYA SIDO LIQUIDADO AUN
  //--SI NO ESTA LIQUIDADA APARECERÁ
  //---Actualizar codigo_ctr, descripcion_ctr, estado_gestor
  async liquidarOrdenes(updateOrdeneDto:UpdateOrdeneDto[], usuario:any) {
    let actualizados = 0;
    return await Promise.all(updateOrdeneDto.map(async(ordenUpdate) => 
      await this.ordenModel.findOne({ codigo_requerimiento: String(ordenUpdate.codigo_requerimiento) }).then((ordenBase) => {
        if (ordenBase) {
          let nuevoEstado = String(ordenUpdate.tipo_liquidacion).toUpperCase() === tiposLiquidacion.ANULADA 
                                      ? estadoGestor.ANULADO : estadoGestor.LIQUIDADO;
          let historial_registro:Array<HistorialRegistro> = [];
          let objUpdate = { estado_gestor: nuevoEstado };

          if (ordenUpdate.fecha_liquidado) objUpdate["fecha_liquidado"] = ordenUpdate.fecha_liquidado;
          if (ordenUpdate.tecnico_liquidado) objUpdate["tecnico_liquidado"] = ordenUpdate.tecnico_liquidado;
          if (ordenUpdate.nombre_liquidado) objUpdate["nombre_liquidado"] = ordenUpdate.nombre_liquidado;
          if (ordenUpdate.tipo_averia) objUpdate["tipo_averia"] = ordenUpdate.tipo_averia;
          if (ordenUpdate.codigo_usuario_liquidado) objUpdate["codigo_usuario_liquidado"] = ordenUpdate.codigo_usuario_liquidado;
          if (ordenUpdate.observacion_liquidado) objUpdate["observacion_liquidado"] = ordenUpdate.observacion_liquidado;
          if (ordenUpdate.descripcion_codigo_liquidado) objUpdate["descripcion_codigo_liquidado"] = ordenUpdate.descripcion_codigo_liquidado;
          if (ordenUpdate.estado_liquidado) objUpdate["estado_liquidado"] = ordenUpdate.estado_liquidado;
          
          if (ordenUpdate.codigo_nodo && ordenBase.codigo_nodo !== ordenUpdate.codigo_nodo) {
            objUpdate['codigo_nodo'] = ordenUpdate.codigo_nodo;
            historial_registro.push({
              usuario_entrada: usuario,
              estado_orden: nuevoEstado,
              observacion: "Se detectó un cambio de nodo al liquidar.",
              codigo_ctr: ordenUpdate.codigo_ctr
            });
          };

          if (ordenBase.estado_gestor !== nuevoEstado && ordenUpdate.codigo_ctr && Number(ordenBase.codigo_ctr) === Number(ordenUpdate.codigo_ctr)) {
            historial_registro.push({
              usuario_entrada: usuario,
              estado_orden: nuevoEstado,
              empleado_modificado: ordenUpdate.tecnico_liquidado,
              observacion: ordenUpdate.observacion_liquidado  ? 
                ordenUpdate.observacion_liquidado : 'Orden liquidada desde la data exportada de cms.',
              codigo_ctr: ordenUpdate.codigo_ctr
            });
          } else if (ordenUpdate.codigo_ctr && Number(ordenBase.codigo_ctr) !== Number(ordenUpdate.codigo_ctr)) {
            objUpdate["codigo_ctr"] = ordenUpdate.codigo_ctr;
            historial_registro.push({
              usuario_entrada: usuario,
              estado_orden: nuevoEstado,
              observacion: 'Orden liquidada en otra bandeja.',
              codigo_ctr: ordenUpdate.codigo_ctr
            });
          };

          if (historial_registro.length > 0) {
            actualizados = actualizados+1;
            return ({
              "updateOne": {
                "filter": { "codigo_requerimiento": String(ordenUpdate.codigo_requerimiento) },
                "update": {
                  "$set": objUpdate,
                  "$push": { historial_registro: { "$each": historial_registro } }
                },
                "upsert": false
              }
            })
          } else {
            return ({
              "updateOne": {
                "filter": { "codigo_requerimiento": String(ordenUpdate.codigo_requerimiento) },
                "update": {
                  "$set": objUpdate,
                },
                "upsert": false
              }
            })
          };
        } else { return null;}
      })
    )).then(async (data) => await this.ordenModel.bulkWrite(data.filter((e) => e), { ordered: false })
        .then((res) => res.result)
        .catch((err) => err.result)
    ).then((res) => ({
      total: res,
      nuevos: res.nInserted, 
      actualizados,
      duplicados: res.nModified,
    }));
  };
  //FUNCION PARA TRAER LAS ORDENES PENDIENTES DE RED CLIENTE
  async obtenerOrdenesPendientes(tipo:string, nodos:string[]) {
    const gestorPendientes = [
      estadoGestor.PENDIENTE,
      estadoGestor.AGENDADO,
      estadoGestor.ASIGNADO,
      estadoGestor.INICIADO,
      estadoGestor.SUSPENDIDO,
      estadoGestor.NO_REALIZADO,
      estadoGestor.MASIVO,
      estadoGestor.REMEDY,
      estadoGestor.COMPLETADO,
      estadoGestor.CANCELADO,
      estadoGestor.OBSERVADO
    ].map((e) => String(e).toLowerCase());

    let query = {
      "estado_gestor": { "$in": gestorPendientes },
      "codigo_ctr": bandejasLiteyca.LITEYCA,
    };
   
    if (tipo) {
      query["tipo"] = tipo;
    };

    if (nodos && nodos.length > 0) {
      query["codigo_nodo"] = { "$in": nodos }
    };

    return await this.ordenModel.aggregate([
      { "$match": query },
      { "$sort": { "bucket": 1, "estado_toa": 1, "contrata": 1 } },
      {
        "$lookup": {
          "from": "contratas",
          "foreignField": "_id",
          "localField": "contrata",
          "as": "contrata"
        }
      },
      {
        "$lookup": {
          "from": "empleados",
          "foreignField": "_id",
          "localField": "gestor",
          "as": "gestor"
        }
      },
      {
        "$lookup": {
          "from": "empleados",
          "localField": "tecnico",
          "foreignField": "_id",
          "as": "tecnico"
        }
      },
      {
        "$lookup": {
          "from": "empleados",
          "foreignField": "_id",
          "localField": "tecnico_liteyca",
          "as": "tecnico_liteyca"
        }
      },
      { 
        "$group": {
          "_id": "$tipo",
          "data": {
            "$push": {
              "_id": "$_id",
              "bucket": "$bucket",
              "codigo_requerimiento": "$codigo_requerimiento",
              "codigo_nodo": "$codigo_nodo",
              "codigo_troba": "$codigo_troba",
              "codigo_trabajo": "$codigo_trabajo",
              "codigo_peticion": "$codigo_peticion",
              "codigo_cliente": "$codigo_cliente",
              "contrata": {
                "$let": {
                  "vars": {
                    "contrata": {
                      "$mergeObjects": [
                        {$arrayElemAt: [ "$contrata", 0 ]},
                        "$contrata_nuevo"
                      ]
                    }
                  },
                  "in": {
                    "_id": { "$toString": "$$contrata._id" },
                    "nombre": "$$contrata.nombre",
                  }
                }
              },
              "direccion": "$direccion",
              "direccion_polar_x": "$direccion_polar_x",
              "direccion_polar_y": "$direccion_polar_y",
              // "direccion_avenida": "$direccion_avenida",
              "distrito": "$distrito",
              "estado_toa": "$estado_toa",
              "estado_gestor": "$estado_gestor",
              "fecha_cita": "$fecha_cita",
              "fecha_asignado": "$fecha_asignado",
              "fecha_registro": "$fecha_registro",
              "gestor": {
                "$let": {
                  "vars": {
                    "empleado": {
                      "$mergeObjects": [
                        { $arrayElemAt: [ "$gestor", 0 ] },
                        "$gestor_nuevo"
                      ]
                    }
                  },
                  "in": {
                    "_id": { "$toString": "$$empleado._id" },
                    "nombre": "$$empleado.nombre",
                    "apellidos": "$$empleado.apellidos",
                  }
                }
              },
              "indicador_pai": "$indicador_pai",
              "infancia": { "$toString": "$infancia" },
              "numero_reiterada": "$numero_reiterada",
              "observacion_gestor": "$observacion_gestor",
              "observacion_toa": "$observacion_toa",
              "subtipo_actividad": "$subtipo_actividad",
              "tipo": "$tipo",
              "tipo_requerimiento": "$tipo_requerimiento",
              "tipo_tecnologia": "$tipo_tecnologia",
              "tecnico": {
                "$let": {
                  "vars": {
                    "empleado": {
                      "$mergeObjects": [
                        {$arrayElemAt: [ "$tecnico", 0 ]},
                        "$tecnico_nuevo"
                      ]
                    }
                  },
                  "in": {
                    "_id": { "$toString": "$$empleado._id" },
                    "nombre": "$$empleado.nombre",
                    "apellidos": "$$empleado.apellidos"
                  }
                }
              },
              "tecnico_liteyca": {
                "$let": {
                  "vars": {
                    "empleado": {
                      "$mergeObjects": [
                        {$arrayElemAt: [ "$tecnico_liteyca", 0 ]},
                        "$tecnico_liteyca_nuevo"
                      ]
                    }
                  },
                  "in": {
                    "_id": { "$toString": "$$empleado._id" },
                    "nombre": "$$empleado.nombre",
                    "apellidos": "$$empleado.apellidos"
                  }
                }
              },
              "tipo_agenda": "$tipo_agenda",
              "tipo_cita": "$tipo_cita"
            }
          }
        }
      }
    ])   
  };

  async obtenerOrdenesGestorPendientes(gestor?:any) {
    const gestorPendientes = [
      estadoGestor.PENDIENTE,
      estadoGestor.AGENDADO,
      estadoGestor.ASIGNADO,
      estadoGestor.INICIADO,
      estadoGestor.SUSPENDIDO,
      estadoGestor.NO_REALIZADO,
      estadoGestor.MASIVO,
      estadoGestor.REMEDY,
      estadoGestor.COMPLETADO,
      estadoGestor.CANCELADO,
      estadoGestor.OBSERVADO
    ];

    let query = {}

    if (gestor) {
      query = {
        "estado_gestor": { "$in": gestorPendientes },
        "gestor": Types.ObjectId(gestor),
        "codigo_ctr": { $in: bandejasRC },
      };
    } else {
      query = {
        "estado_gestor": { "$in": gestorPendientes },
        "gestor": { $ne: null},
        "codigo_ctr": { $in: bandejasRC },
      };
    };

    return await this.ordenModel.aggregate([
      { "$match": query },
      { "$sort": { "bucket": 1, "estado_toa": 1 } },
      {
        "$lookup": {
          "from": "contratas",
          "foreignField": "_id",
          "localField": "contrata",
          "as": "contrata"
        }
      },
      {
        "$lookup": {
          "from": "empleados",
          "localField": "tecnico",
          "foreignField": "_id",
          "as": "tecnico"
        }
      },
      {
        "$lookup": {
          "from": "empleados",
          "foreignField": "_id",
          "localField": "tecnico_liteyca",
          "as": "tecnico_liteyca"
        }
      },
      { 
        "$group": {
          "_id": { "$toString": "$gestor" },
          "data": {
            "$push": {
              "_id": "$_id",
              "bucket": "$bucket",
              "codigo_cliente": "$codigo_cliente",
              "codigo_ctr": "$codigo_ctr",
              "codigo_nodo": "$codigo_nodo",
              "codigo_peticion": "$codigo_peticion",
              "codigo_requerimiento": "$codigo_requerimiento",
              "codigo_trabajo": "$codigo_trabajo",
              "codigo_troba": "$codigo_troba",
              "contrata": {
                "$let": {
                  "vars": {
                    "contrata": {
                      "$mergeObjects": [
                        {$arrayElemAt: [ "$contrata", 0 ]},
                        "$contrata_nuevo"
                      ]
                    }
                  },
                  "in": {
                    "_id": { "$toString": "$$contrata._id" },
                    "nombre": "$$contrata.nombre",
                  }
                }
              },
              "direccion": "$direccion",
              "direccion_polar_x": "$direccion_polar_x",
              "direccion_polar_y": "$direccion_polar_y",
              // "direccion_avenida": "$direccion_avenida",
              "distrito": "$distrito",
              "estado_toa": "$estado_toa",
              "estado_gestor": "$estado_gestor",
              "fecha_cita": "$fecha_cita",
              "fecha_asignado": "$fecha_asignado",
              "fecha_registro": "$fecha_registro",
              "infancia": { "$toString": "$infancia" },
              "numero_reiterada": "$numero_reiterada",
              "observacion_gestor": "$observacion_gestor",
              "observacion_toa": "$observacion_toa",
              "tecnico": {
                "$let": {
                  "vars": {
                    "empleado": {
                      "$mergeObjects": [
                        {$arrayElemAt: [ "$tecnico", 0 ]},
                        "$tecnico_nuevo"
                      ]
                    }
                  },
                  "in": {
                    "_id": { "$toString": "$$empleado._id" },
                    "nombre": "$$empleado.nombre",
                    "apellidos": "$$empleado.apellidos"
                  }
                }
              },
              "tecnico_liteyca": {
                "$let": {
                  "vars": {
                    "empleado": {
                      "$mergeObjects": [
                        {$arrayElemAt: [ "$tecnico_liteyca", 0 ]},
                        "$tecnico_liteyca_nuevo"
                      ]
                    }
                  },
                  "in": {
                    "_id": { "$toString": "$$empleado._id" },
                    "nombre": "$$empleado.nombre",
                    "apellidos": "$$empleado.apellidos"
                  }
                }
              },
              "tipo": "$tipo",
              "tipo_cita": "$tipo_cita",
              "tipo_requerimiento": "$tipo_requerimiento",
              "tipo_tecnologia": "$tipo_tecnologia",
              "tipo_agenda": "$tipo_agenda",
            }
          }
        }
      }
    ])   
  };
  //funcion para obtener las ordenesa a exportar
  async obtenerPendientesExportar(todo:number, tipo:string, nodos:string[], ordenes?:string[]) {
    let objQuery:any = {};
    const gestorPendientes = [
      estadoGestor.PENDIENTE,
      estadoGestor.AGENDADO,
      estadoGestor.ASIGNADO,
      estadoGestor.INICIADO,
      estadoGestor.MASIVO,
      estadoGestor.SUSPENDIDO,
      estadoGestor.REMEDY,
      estadoGestor.OBSERVADO
    ];
    
    if (Number(todo) === 1) {
      objQuery = {
        $and: [
          { "estado_gestor": { "$in": gestorPendientes } },
          { codigo_nodo: { $in: nodos } },
          { codigo_ctr: { $in: [bandejasLiteyca.LITEYCA, bandejasLiteyca.CRITICOS] } },
          { tipo },
        ]
      }
    } else {      
      if (!ordenes || ordenes.length < 0 ) {
        throw new HttpException({
          status: 'error',
          message: "No se encontraron ordenes."
        }, HttpStatus.FORBIDDEN)
      }
      objQuery = { codigo_requerimiento: { $in: ordenes } }
    }
    
    return await this.ordenModel.find(objQuery).select({
      tipo: 1,
      codigo_requerimiento: 1,
      codigo_cliente: 1,
      codigo_trabajo: 1,
      codigo_peticion: 1,
      direccion: 1,
      nombre_cliente: 1,
      indicador_pai: 1,
      detalle_trabajo: 1,
      tipo_requerimiento: 1,
      tipo_tecnologia: 1,
      codigo_ctr: 1,
      codigo_nodo: 1,
      codigo_troba: 1,
      numero_reiterada: 1,
      infancia: 1,
      distrito: 1,
      bucket: 1,
      estado_toa: 1,
      estado_gestor: 1,
      contrata: 1,
      gestor: 1,
      gestor_liteyca: 1,
      auditor: 1,
      tecnico: 1,
      tecnico_liteyca: 1,
      fecha_cita: 1,
      tipo_agenda: 1,
      fecha_registro: 1,
      fecha_asignado: 1,
      fecha_liquidado: 1,
      orden_devuelta: 1,
      observacion_toa: 1,
      observacion_gestor: 1,
      subtipo_actividad: 1,
    }).populate({
      path: 'infancia',
      select: 'codigo_requerimiento tecnico_liquidado fecha_registro fecha_liquidado codigo_ctr',
      populate: {
        path: 'tecnico_liquidado',
        select: 'nombre apellidos carnet gestor',
        populate: {
          path: 'gestor',
          select: 'nombre apellidos'
        }
      }
    }).populate({
      path: 'tecnico_liteyca', 
      select: 'nombre apellidos carnet supervisor',
      populate: {
        path: 'supervisor',
        select: 'nombre apellidos carnet'
      }
    }).populate('contrata', 'nombre')
      .populate('gestor tecnico', 'nombre apellidos carnet supervisor')
  };

  async obtenerPendientesExportarGestor(gestor:string, ordenes:string[], todo:number, ) {
    let objQuery:any = {};
    const gestorPendientes = [
      estadoGestor.PENDIENTE,
      estadoGestor.AGENDADO,
      estadoGestor.ASIGNADO,
      estadoGestor.INICIADO,
      estadoGestor.MASIVO,
      estadoGestor.SUSPENDIDO,
      estadoGestor.REMEDY,
      estadoGestor.OBSERVADO
    ];
    
    if (Number(todo) === 1) {
      objQuery = {
        $and: [
          { "estado_gestor": { "$in": gestorPendientes } }, 
          { gestor: gestor },
          { codigo_ctr: { $in: [bandejasLiteyca.LITEYCA, bandejasLiteyca.CRITICOS] } },
        ]
      }
    } else {      
      if (!ordenes || ordenes.length < 0 ) {
        throw new HttpException({
          status: 'error',
          message: "No se encontraron ordenes."
        }, HttpStatus.FORBIDDEN)
      }
      objQuery = { codigo_requerimiento: { $in: ordenes } }
    }
    
    return await this.ordenModel.find(objQuery).select({
      tipo: 1,
      codigo_requerimiento: 1,
      codigo_cliente: 1,
      codigo_trabajo: 1,
      codigo_peticion: 1,
      direccion: 1,
      nombre_cliente: 1,
      indicador_pai: 1,
      tipo_requerimiento: 1,
      tipo_tecnologia: 1,
      codigo_ctr: 1,
      codigo_nodo: 1,
      codigo_troba: 1,
      detalle_trabajo: 1,
      numero_reiterada: 1,
      infancia: 1,
      distrito: 1,
      bucket: 1,
      estado_toa: 1,
      estado_gestor: 1,
      contrata: 1,
      gestor: 1,
      tecnico: 1,
      tecnico_liteyca: 1,
      fecha_cita: 1,
      tipo_agenda: 1,
      fecha_registro: 1,
      fecha_asignado: 1,
      fecha_liquidado: 1,
      orden_devuelta: 1,
      observacion_toa: 1,
      observacion_gestor: 1,
      subtipo_actividad: 1,
    }).populate({
      path: 'infancia',
      select: 'codigo_requerimiento tecnico_liquidado fecha_registro fecha_liquidado codigo_ctr',
      populate: {
        path: 'tecnico_liquidado',
        select: 'nombre apellidos carnet gestor',
        populate: {
          path: 'gestor',
          select: 'nombre apellidos'
        }
      }
    }).populate({
      path: 'tecnico_liteyca', 
      select: 'nombre apellidos carnet supervisor',
      populate: {
        path: 'supervisor',
        select: 'nombre apellidos carnet'
      }
    }).populate('contrata', 'nombre')
      .populate('gestor tecnico', 'nombre apellidos carnet supervisor')
  };
  //funcion que obtiene las liquidadas dependiendo de un rango de fechas
  async obtenerOrdenesLiquidadas(nodos:string[],gestor:string, tipo:string, fechaInicio:Date, fechaFin:Date) {
    let objQuery:any = { codigo_requerimiento: null };
    let fi = DateTime.fromJSDate(new Date(fechaInicio));
    let ff = DateTime.fromJSDate(new Date(fechaFin));
    const field = gestor ? 'gestor' : 'tipo'

    if (!fechaInicio || !fechaFin) {
      let dia = DateTime.fromJSDate(new Date()).set({hour: 0}).set({minute: 0}).set({second: 0});

      objQuery = {
        $and: [
          { fecha_liquidado: { $gte: dia.toJSDate() } } ,
          { codigo_ctr: { $in: bandejasRC } },
          { codigo_nodo: { $in: nodos } },
          { estado_gestor: estadoGestor.LIQUIDADO },
          { [field]: gestor ? gestor : tipo }
        ]
      };

    } else if (fi.get('year') > 2000 && ff.get('year') > 2000) {
      let inicioUTC = new Date(Date.UTC(fi.get('year'), fi.get('month')-1, fi.get('day'), 0, 0, 0));
      let finUTC = new Date(Date.UTC(ff.get('year'), ff.get('month')-1, ff.get('day'), 0, 0, 0));
      
      objQuery = {
        $and: [
          { fecha_liquidado: { $gte: inicioUTC, $lte: finUTC } } ,
          { codigo_ctr: { $in: bandejasRC } },
          { estado_gestor: estadoGestor.LIQUIDADO },
          { [field]: gestor ? gestor : tipo }
        ]
      };
    };     

    return await this.ordenModel.find(objQuery).populate('contrata', 'nombre')
      .populate('gestor contrata', 'nombre apellidos carnet')
      .populate('infancia', 'codigo_requerimiento codigo_ctr subtipo_actividad')
      .populate({
        path: 'tecnico_liquidado',
        select: 'nombre apellidos carnet supervisor',
        populate: {
          path: 'supervisor',
          select: 'nombre apellidos carnet',
        }
      }).select({
        tipo: 1,
        bucket: 1,
        codigo_cliente: 1,
        codigo_ctr: 1,
        codigo_nodo: 1,
        codigo_requerimiento: 1,
        codigo_troba: 1,
        codigo_usuario_liquidado: 1,
        contrata: 1,
        descripcion_codigo_liquidado: 1,
        distrito: 1,
        estado_toa: 1,
        estado_gestor: 1,
        estado_liquidado: 1,
        fecha_cita: 1,
        fecha_liquidado: 1,
        fecha_registro: 1,
        gestor: 1,
        infancia: 1,
        numero_reiterada: 1,
        nombre_cliente: 1,
        observacion_gestor: 1,
        observacion_liquidado: 1,
        observacion_toa: 1,
        subtipo_actividad: 1,
        tipo_tecnologia: 1,
        tecnico_liquidado: 1,
        tipo_averia: 1,
        tipo_agenda: 1,
      }).sort('bucket estado_toa contrata');
  };
  async obtenerOrdenesOtrasBandejas(tipo: string, bandeja: number) {
    const gestorPendientes = [
      estadoGestor.PENDIENTE,
      estadoGestor.AGENDADO,
      estadoGestor.ASIGNADO,
      estadoGestor.INICIADO,
      estadoGestor.SUSPENDIDO,
      estadoGestor.NO_REALIZADO,
      estadoGestor.MASIVO,
      estadoGestor.REMEDY,
      estadoGestor.COMPLETADO,
      estadoGestor.CANCELADO
    ].map((e) => String(e).toLowerCase());

    return await this.ordenModel.find({ 
      $and: [
        { "estado_gestor": { "$in": gestorPendientes } },
        { codigo_ctr: bandeja },
        { tipo },
      ]
    }).select({
      bucket: 1,
      codigo_requerimiento: 1,
      codigo_nodo: 1,
      codigo_troba: 1,
      codigo_trabajo: 1,
      codigo_peticion: 1,
      codigo_cliente: 1,
      codigo_zonal: 1,
      contrata: 1,
      direccion: 1,
      direccion_avenida: 1,
      distrito: 1,
      estado_toa: 1,
      estado_gestor: 1,
      fecha_cita: 1,
      fecha_asignado: 1,
      fecha_registro: 1,
      gestor: 1,
      indicador_pai: 1,
      infancia: 1,
      numero_reiterada: 1,
      observacion_gestor: 1,
      observacion_toa: 1,
      subtipo_actividad: 1,
      tipo: 1,
      tipo_requerimiento: 1,
      tipo_tecnologia: 1,
      tecnico: 1,
      tecnico_liteyca: 1,
      tipo_agenda: 1,
      tipo_cita: 1,
    }).populate('contrata gestor tecnico tecnico_liteyca', 'nombre apellidos carnet').sort('bucket estado_toa');
  };
  async obtenerOrdenesAnuladas(tipo: string) {
    let dia = DateTime.fromJSDate(new Date());
    let startOfToday = new Date(Date.UTC(dia.get('year'), dia.get('month')-1, dia.get('day'), 0, 0, 0, 0));
    const nodosTotal = await this.zonasService.listarZonas().then((zonas) => zonas.length > 0 ? Array.prototype.concat.apply([], zonas.map((z) => z.nodos)) : []);
    
    return await this.ordenModel.find({ 
      $and: [
        { $or: [
          {fecha_liquidado: { $gte: startOfToday }},
          {fecha_liquidado: null}
        ]},
        { estado_gestor: estadoGestor.ANULADO },
        { codigo_nodo: { $in: nodosTotal } },
        { tipo },
      ]
    }).populate('contrata gestor tecnico tecnico_liquidado', 'nombre apellidos carnet').select({
        codigo_requerimiento: 1,
        codigo_ctr: 1,
        descripcion_ctr: 1,
        codigo_nodo: 1,
        codigo_troba: 1,
        codigo_cliente: 1,
        distrito: 1,
        tipo_tecnologia: 1,
        estado_toa: 1,
        estado_gestor: 1,
        estado_liquidado: 1,
        contrata: 1,
        gestor: 1,
        tecnico: 1,
        tecnico_liquidado: 1,
        codigo_usuario_liquidado: 1,
        tipo_averia: 1,
        descripcion_codigo_liquidado: 1,
        fecha_asignado: 1,
        fecha_registro: 1,
        fecha_liquidado: 1,
        observacion_gestor: 1,
        observacion_liquidado: 1
    }).sort('bucket estado_toa');
  };
  //funcion para obtener las reiteradas
  async obtenerOrdenesReiteradas(codigo_cliente:string): Promise<Ordene[]> {
    let haceUnMes = DateTime.fromJSDate(new Date()).plus({month: -1}).toJSDate();
    return await this.ordenModel.find({
      $and: [
        { codigo_cliente },
        { fecha_liquidado: { $gte: haceUnMes } },
      ]
    }).populate({
      path: 'tecnico_liquidado', 
      select: 'nombre apellidos contrata gestor auditor',
      populate: [
        {
          path: 'contrata',
          select: 'nombre'
        },
        {
          path: 'gestor',
          select: 'nombre apellidos'
        },
        {
          path: 'auditor',
          select: 'nombre apellidos'
        }
      ]
    })
  };
  //funcion para obtener la orden de infancia
  async obtenerInfancia(_id: string): Promise<Ordene> {
    return await this.ordenModel.findById({_id}).populate({
      path: 'tecnico_liquidado',
      select: 'nombre apellidos carnet gestor',
      populate: {
        path: 'gestor',
        select: 'nombre apellidos carnet'
      }
    });
  };
  //funcion que busca el registro por el codigo de requerimientoi
  async obtenerRegistrosOrden(requerimiento:string) {
    return await this.ordenModel.findOne({codigo_requerimiento: requerimiento})
      .select("historial_registro")
      .populate("historial_registro.contrata_modificado historial_registro.empleado_modificado historial_registro.usuario_entrada", "nombre apellidos")
      .populate({
        path: "empleado_modificado.cargo",
        select: "nombre nivel"
      })
      .then((data) => {
        if (data && data.historial_registro.length > 0) {
          return data.historial_registro;
        } else {
          return [];
        }
      });
  };
  //funcion para obtener el detalle de la orden ya sea averia o alta
  async obtenerDetalleOrden(requerimiento:string): Promise<Ordene> {
    return await this.ordenModel.findOne({codigo_requerimiento: requerimiento})
  };
  //funcion para agendar una orden
  async agendarOrden(ordenes:string[], usuario:any, gestor?:any, tecnico?:any, fecha_cita?:Date, observacion?: string) {
    let observacion_gestor = observacion ? observacion 
      : `Orden agendada para el dia ${DateTime.fromJSDate(fecha_cita, { zone: 'America/Lima' }).toFormat("dd/MM")}`;

    let registroOrdenes:Partial<HistorialRegistro> = {
      observacion: observacion_gestor,
      usuario_entrada: usuario,
      empleado_modificado: gestor,
      estado_orden: estadoGestor.AGENDADO
    };

    let objUpdate = { fecha_cita, estado_gestor: estadoGestor.AGENDADO, observacion_gestor }

    if (gestor) objUpdate["gestor"] = gestor;

    return await this.ordenModel.updateMany({ codigo_requerimiento: { $in: ordenes } }, {
      $set: objUpdate,
      $push: { historial_registro: registroOrdenes }
    })
  };
  //funcion para asignar personal a una orden
  async asignarOrden(ordenes:string[], usuario:any, contrata?:any, gestor?:any, tecnico?:any, carnet?:any, observacion?: string):Promise<string> {
    if (ordenes.length === 0) throw ({message: "No se encontraron ordenes."})
    const estadosPermitidos = ['-', String(estadosToa.PENDIENTE).toLowerCase()]
    const gestorBase = await this.empleadoService.buscarPorId(usuario);
    const ordenesBase = await this.ordenModel.find({ codigo_requerimiento: { $in: ordenes } }).select('estado_toa codigo_requerimiento');
    // const ordenesTrabajando = ordenesBase.filter((e) => !estadosPermitidos.includes(String(e.estado_toa)));
    // if (ordenesTrabajando.length > 0) throw ({message: "Solo puedes asignar ordenes pendientes."})
    
    let objUpdate:Partial<Ordene> = {};
    let mensaje = `(${ordenes.length}) Ordenes Asignadas correctamente.`;

    let registroOrdenes:Partial<HistorialRegistro> = {
      observacion: observacion ? observacion : 'Orden asignada.',
      usuario_entrada: usuario,
      contrata_modificado: contrata,
      empleado_modificado: tecnico ? tecnico: gestor,
      estado_orden: estadoGestor.ASIGNADO
    };

    if (contrata  && contrata.length > 5) {
      objUpdate['contrata'] = contrata;
    }
    if (gestor  && gestor.length > 5) {
      objUpdate['gestor'] = gestor;
      objUpdate['estado_gestor'] = estadoGestor.ASIGNADO;
    }
    if (tecnico && tecnico.length > 5 && carnet) {
      //SOLO ACTUALIZAR EN TOA ORDENES PENDIENTES
      let pendientes = ordenesBase.filter((e) => String(e.estado_toa).toLowerCase() === String(estadosToa.PENDIENTE).toLowerCase());
      
      if (gestorBase.usuario.toa_pass && gestorBase.carnet && pendientes.length > 0) {
        // aqui asigna a toa
        const data = {
          usr: gestorBase.carnet,
          pwd: gestorBase.usuario.toa_pass,
          carnet,
          ordenes: pendientes.map((e) => e.codigo_requerimiento),
        }
        console.log(data);
        await this.httpService.post('http://10.0.1.5:8000/api/ordenes/', data).toPromise()
          .then(({data}) => {
            console.log(data);
            if(data.message) mensaje = data.message
          })
        // aqui termina
        // mensaje = `(${pendientes.length}/${ordenes.length}) Ordenes Asignadas correctamente.`;
      };
      objUpdate['tecnico_liteyca'] = tecnico;
      objUpdate['estado_gestor'] = estadoGestor.ASIGNADO;
    }

    // if (observacion) objUpdate['observacion_gestor'] = observacion;

    console.log(carnet, ordenes)
    
    return await this.ordenModel.updateMany({ codigo_requerimiento: { $in: ordenes } }, {
      $set: { ...objUpdate },
      $push: { historial_registro: registroOrdenes },
    }).then(() => mensaje)
  };
  //funcion para cambiar el estado de la orden, agregar una observacion y subir imagenes si las haya
  async actualizarEstadoOrden(usuario:any, ordenes:string[], observacion:string, estado?:string) {
      let objUpd:Partial<Ordene> = {};

      let registro:Partial<HistorialRegistro> = {
        usuario_entrada: usuario,
        observacion: observacion ? observacion : `Orden Modificada (${estado}).`,
        estado_orden: estado ? estado :'-',
      };
  
      if (estado && estado !== 'null') objUpd.estado_gestor = estado;
      if (observacion && observacion !== 'null') objUpd.observacion_gestor = observacion
      
      return await this.ordenModel.updateMany(
        {  codigo_requerimiento: { $in: ordenes } }, 
        { $set: {...objUpd }, $push: { historial_registro: registro } })
  };
   //funcion para agregar una observacion a la orden
  async agregarObservacion(usuario:any, ordenes:string[], observacion:string) {
    let registro: Partial<HistorialRegistro> = {
      usuario_entrada: usuario,
      observacion: observacion,
    };
      
    return await this.ordenModel.updateMany({ codigo_requerimiento: { $in: ordenes } } , { 
      $set: { observacion_gestor: observacion }, $push: { historial_registro: registro } 
    })
  };
  //funcion para traer los datos de redis
  async listarOrdenesRedis(zonas:string[], negocio:string, intervalo: number): Promise<Array<TOrdenesToa>> {
    const nuevoNegocio = negocio.toUpperCase();
    let nuevasZonas = []
    let totalOrdenes = [];
    
    for (const zona of zonas) {
      await this.zonasService.buscarZonaNombre(zona.toUpperCase()).then((zona) => {
        if (zona && zona.nodos) {
          nuevasZonas = nuevasZonas.concat(zona.nodos);
        }
      })
    }
   
    if (nuevoNegocio === 'TODO') {
      try {
        await this.redisService.get(redisKeys[`LIMA_ALTAS${intervalo === 2 ? "_FINAL" : ""}`]).then((e:any) => e && e.length !== 0 ? totalOrdenes.push(...e) : null);
        await this.redisService.get(redisKeys[`LIMA_AVERIAS${intervalo === 2 ? "_FINAL" : ""}`]).then((e:any) => e && e.length !== 0 ? totalOrdenes.push(...e) : null);
        await this.redisService.get(redisKeys[`PROVINCIA_ALTAS${intervalo === 2 ? "_FINAL" : ""}`]).then((e:any) => e && e.length !== 0 ? totalOrdenes.push(...e) : null);
        await this.redisService.get(redisKeys[`PROVINCIA_AVERIAS${intervalo === 2 ? "_FINAL" : ""}`]).then((e:any) => e && e.length !== 0 ? totalOrdenes.push(...e) : null);

        return totalOrdenes.filter((e:TOrdenesToa) => e && nuevasZonas.includes(e.nodo));
      } catch (error) {
        throw error;
      };
    } else {
      try {
        await this.redisService.get(redisKeys[`LIMA_${nuevoNegocio}${intervalo === 2 ? "_FINAL" : ""}`]).then((e:any) => e && e.length !== 0 ? totalOrdenes.push(...e) : null);
        await this.redisService.get(redisKeys[`PROVINCIA_${nuevoNegocio}${intervalo === 2 ? "_FINAL" : ""}`]).then((e:any) => e && e.length !== 0 ? totalOrdenes.push(...e) : null);
        return totalOrdenes.filter((e:TOrdenesToa) => e && nuevasZonas.includes(e.nodo));
      } catch (error) {
        throw error;
      };
    };
  };  

  //funcion de busqueda por requerimiento, codigo_cliente, orden de trabajo
  async buscarOrden(codigo:string, field:string, limite:number):Promise<Ordene[]> {
    const fieldPermitidos = ["codigo_requerimiento","codigo_cliente","codigo_trabajo"];
    const dia = DateTime.fromJSDate(new Date()).plus({ month: -1 }).toJSDate();
    let objQuery:FilterQuery<Ordene> = {};
    
    if (fieldPermitidos.includes(field)) {
      if (Number(limite) === 1) {
        objQuery = {
          [field]: codigo,
          fecha_registro: { $gte: dia }
        }
      } else if (Number(limite) === 0) {
        objQuery = { [field]: codigo }
      } else {
        throw new HttpException("No se estableció el limite", HttpStatus.BAD_REQUEST);
      }
      return await this.ordenModel.find(objQuery)
        .sort('-fecha_registro')
        .populate("tecnico tecnico.supervisor tecnico_liteyca.supervisor gestor contrata", "nombre apellidos carnet supervisor ")
    } else {
      throw new HttpException("Tipo de busqueda no permitido", HttpStatus.BAD_REQUEST);
    }
  };
}
