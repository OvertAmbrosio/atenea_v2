import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DateTime } from 'luxon';

import { EmpleadosService } from '../empleados/empleados.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { Asistencia, AsistenciaDocument, HistorialRegistro } from './schema/asistencia.schema';
import { estadosAsistencia, niveles } from 'src/enums/enumsEmpleados';

@Injectable()
export class AsistenciasService {
  constructor(
    @InjectModel('Asistencia') private readonly asistenciaModel: Model<AsistenciaDocument>,
    @Inject(forwardRef(() => EmpleadosService)) private empleadosService: EmpleadosService
  ) { };

  async actualizarEmpleadoAsistencia(tecnicos: string[]) {
    const hoy = DateTime.fromJSDate(new Date()).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    const empleados = await this.empleadosService.buscarMuchosId(tecnicos);
    console.log(hoy.toJSDate(), '--- Hora asistencia en adelante >');

    if (empleados && empleados.length > 0) {
      return await Promise.all(empleados.map(async (empleado) => {

        return await this.asistenciaModel.updateMany({
          $and: [
            { "empleado._id": empleado._id },
            { fecha_asistencia: { $gte: hoy.toJSDate() } }
          ]
        }, { $set: { empleado } })
      }))
    } else {
      console.log('no se encontro empleados');
      return;
    }
  };

  async crearAsistencia(usuarioId: any, usuarioNombre: string, nivel: number, createAsistenciaDto: CreateAsistenciaDto): Promise<Asistencia> {
    const fechaJs = new Date(createAsistenciaDto.fecha)
    const hoy = DateTime.fromJSDate(fechaJs).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    const mañana = DateTime.fromJSDate(fechaJs).set({ hour: 23, minute: 59, second: 59, millisecond: 0 });

    const empleado = await this.empleadosService.buscarPorId(createAsistenciaDto.empleado)

    if (empleado && empleado.cargo.nivel < nivel) throw new HttpException('No cuentas con los permisos necesarios.', HttpStatus.NOT_FOUND);

    if (empleado) {
      return await this.asistenciaModel.findOne({
        $and: [
          { "empleado._id": empleado._id },
          { fecha_asistencia: { $gte: hoy.toJSDate(), $lte: mañana.toJSDate() } }
        ]
      }).then(async (obj) => {
        if (obj) {
          throw new HttpException('Ya existe un registro para esa fecha.', HttpStatus.NOT_FOUND);
        } else {
          const registro = {
            usuario: usuarioId,
            fecha_registro: new Date(),
            observacion: createAsistenciaDto.observacion ? createAsistenciaDto.observacion
              : `Asistencia (${createAsistenciaDto.estado}) creada por ${usuarioNombre}.`
          };
          createAsistenciaDto.empleado = empleado;
          createAsistenciaDto.empleado.cargo = empleado.cargo._id;
          createAsistenciaDto.cargo = empleado.cargo._id
          createAsistenciaDto.fecha_asistencia = DateTime.fromJSDate(fechaJs).plus({ hour: 5 }).toJSDate();
          createAsistenciaDto.historial_registro = [registro];

          return await new this.asistenciaModel(createAsistenciaDto).save()
        }
      })
    } else {
      throw new HttpException('No existe el empleado.', HttpStatus.NOT_FOUND);
    };
  };

  async actualizarAsistencia(usuarioId: any, usuarioNombre: string, nivel: number, id: string, estado: string, observacion?: string, app?: boolean): Promise<Asistencia> {
    const hoy = DateTime.fromJSDate(new Date(), { zone: "America/Lima" });
    const dia = hoy.get('day');
    const mes = hoy.get('month');
    const hora = hoy.get('hour');

    if (nivel === niveles.ASIGNADOS && hora > 9 && !app) throw new HttpException('La asistencia solo se puede actualizar hasta las 9:00.', HttpStatus.BAD_REQUEST);

    return await this.asistenciaModel.findById(id).then(async (obj) => {
      if (obj) {
        const diaAsistencia = DateTime.fromJSDate(obj.fecha_asistencia, { zone: "America/Lima" }).get('day');
        const mesAsistencia = DateTime.fromJSDate(obj.fecha_asistencia, { zone: "America/Lima" }).get('month');
        if ((nivel > niveles.JEFES_MINI_PERSONAL && diaAsistencia !== dia) || (nivel > niveles.JEFES_MINI_PERSONAL && mesAsistencia !== mes)) {
          throw new HttpException('No tienes permisos para actualizar otros dias.', HttpStatus.BAD_REQUEST)
        } else {
          const empleadoObj = await this.empleadosService.buscarPorId(obj.empleado._id)

          return await this.asistenciaModel.findByIdAndUpdate({
            _id: id
          }, {
            $set: {
              empleado: {
                ...empleadoObj,
                cargo: empleadoObj.cargo._id
              },
              estado,
            },
            $push: {
              historial_registro: {
                usuario: usuarioId,
                fecha_registro: new Date(),
                observacion: observacion ? observacion : `Asistencia actualizada (${estado}) por ${usuarioNombre}`
              }
            }
          })
        };
      } else {
        throw new HttpException('No se encuentra el id.', HttpStatus.BAD_REQUEST)
      };
    });
  };

  async listarTodoAsistencia(nivel: number, area: string, zonas: any[], usuarioId: string, fecha_inicio: string, fecha_fin: string, cargo: any): Promise<Asistencia[]> {
    const diaFin = new Date(fecha_fin).getDate();
    const fechaFin = DateTime.fromISO(fecha_fin).set({ day: diaFin });

    let objQuery = {};

    if (nivel < niveles.ASIGNADOS) {
      objQuery = {
        $and: [
          { fecha_asistencia: { $gte: new Date(fecha_inicio), $lte: new Date(fechaFin.toISO()) } },
          { cargo: cargo },
          { "empleado.zonas": { "$in": zonas.map((e) => Types.ObjectId(e)) } }
        ]
      }
    } else {
      const tecnicos = await this.empleadosService.listarPersonalAsignado(usuarioId, "gestor", area, nivel);

      if (tecnicos && tecnicos.length > 0) {
        const ids = tecnicos.map((e) => e._id);
        objQuery = {
          $and: [
            { fecha_asistencia: { $gte: new Date(fecha_inicio), $lte: new Date(fechaFin.toISO()) } },
            { "empleado._id": { $in: ids } }
          ]
        };
      } else {
        throw new HttpException("No hay tecnicos asignados", HttpStatus.NOT_FOUND);
      };
    };

    return await this.asistenciaModel.find(objQuery)
      .sort("-fecha_asistencia empleado.nombre")
      .populate("cargo historial_registro.usuario", "nombre nivel apellidos")
      .populate([
        {
          path: "empleado.tecnico empleado.gestor empleado.supervisor",
          model: "Empleado",
          select: "nombre apellidos carnet"
        }, {
          path: "empleado.cargo",
          model: "Cargo",
          select: "nombre nivel"
        }, {
          path: "empleado.contrata",
          model: "Contrata",
          select: "nombre"
        }, {
          path: "empleado.zonas",
          model: "Zona",
          select: "nombre"
        }
      ]).select("-empleado.usuario -empleado.columnas");
  };

  async listarAsistenciaEfectiva(): Promise<Asistencia[]> {
    const hoy = DateTime.fromJSDate(new Date(), { zone: 'America/Lima' }).set({ hour: 0, minute: 0, second: 58, millisecond: 0 });
    const mañana = DateTime.fromJSDate(new Date(), { zone: 'America/Lima' }).set({ hour: 23, minute: 59, second: 59, millisecond: 0 });

    return await this.asistenciaModel.find({
      estado: estadosAsistencia.ASISTIO,
      fecha_asistencia: { $gte: hoy.toJSDate(), $lte: mañana.toJSDate() },
      "empleado.nivel": 6
    }).populate([
      {
        path: "empleado.gestor empleado.supervisor empleado.auditor",
        model: "Empleado",
        select: "nombre apellidos carnet"
      }, {
        path: "empleado.contrata",
        model: "Contrata",
        select: "nombre"
      }, {
        path: "empleado.zonas",
        model: "Zona",
        select: "nombre"
      }
    ]).select({
      fecha_asistencia: 1,
      fecha_iniciado: 1,
      iniciado: 1,
      "empleado.zonas": 1,
      "empleado.apellidos": 1,
      "empleado.nombre": 1,
      "empleado.carnet": 1,
      "empleado.contrata": 1,
      "empleado.auditor": 1,
      "empleado.gestor": 1,
      "empleado.sub_tipo_negocio": 1,
      "empleado.tipo_negocio": 1,
    })
  };

  async listarAsistenciaSupervisor(usuarioId: string, area: string, nivel: number): Promise<Asistencia[]> {
    const fechaInicio = DateTime.fromJSDate(new Date(), { zone: 'America/Lima' }).set({ hour: 0, minute: 59 }).plus({ hour: -5 });
    const fechaFin = DateTime.fromJSDate(new Date(), { zone: 'America/Lima' }).set({ hour: 23, minute: 59 }).plus({ hour: -5 });

    const tecnicos = await this.empleadosService.listarPersonalAsignado(usuarioId, "supervisor", area, nivel);

    if (tecnicos && tecnicos.length > 0) {
      const ids = tecnicos.map((e) => e._id);
      return await this.asistenciaModel.find({
        $and: [
          { fecha_asistencia: { $gte: fechaInicio.toJSDate(), $lte: fechaFin.toJSDate() } },
          { "empleado._id": { $in: ids } }
        ]
      })
        .sort("empleado.nombre")
        .populate("historial_registro.usuario", "nombre")
        .populate([
          {
            path: "empleado.gestor",
            model: "Empleado",
            select: "nombre apellidos carnet"
          },
        ]).select({
          fecha_asistencia: 1,
          fecha_iniciado: 1,
          iniciado: 1,
          estado: 1,
          _id: 1,
          empleado: {
            estado_empresa: 1,
            sub_tipo_negocio: 1,
            tipo_negocio: 1,
            gestor: 1,
            carnet: 1,
            apellidos: 1,
            nombre: 1,
            _id: 1,
          },
          historial_registro: 1
        })
    } else {
      throw new HttpException("No hay tecnicos asignados", HttpStatus.NOT_FOUND);
    };
  };

  async actualizarFotoRegistro(usuarioId: any, imagen: string, observacion?: string) {
    const fechaHoy = DateTime.fromJSDate(new Date(), { zone: 'America/Lima' }).set({ hour: 0, minute: 0 }).plus({ hour: -5 });
    const fechaFin = DateTime.fromJSDate(new Date(), { zone: 'America/Lima' }).set({ hour: 23, minute: 59 }).plus({ hour: -5 });
    console.log(fechaHoy.toJSDate(), fechaFin.toJSDate(), usuarioId);

    return await this.asistenciaModel.findOneAndUpdate({
      $and: [
        { fecha_asistencia: { "$gte": fechaHoy.toJSDate(), "$lte": fechaFin.toJSDate() } },
        { "empleado._id": Types.ObjectId(usuarioId) }
      ]
    }, {
      $set: {
        estado: estadosAsistencia.ASISTIO,
      },
      $push: {
        historial_registro: {
          usuario: usuarioId,
          fecha_registro: new Date(),
          observacion: observacion ? observacion : "Se agregó una foto desde el perfil del Supervisor.",
          imagen
        }
      }
    })
  };
};
