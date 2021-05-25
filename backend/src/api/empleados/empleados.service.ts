import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { Empleado, EmpleadoDocument } from './schema/empleado.schema';
import { AsistenciasService } from '../asistencias/asistencias.service';
import { VistasService } from '../vistas/vistas.service';
import { CargosService } from '../cargos/cargos.service';
import { ZonasService } from '../zonas/zonas.service';
import { TipoempleadosService } from '../tipoempleados/tipoempleados.service';
import { RedisService } from 'src/database/redis.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { redisKeys } from 'src/config/redisKeys';
import { estadosEmpresa, niveles, tiposUsuarios } from 'src/enums';
import { Zona } from '../zonas/schema/zona.schema';

@Injectable()
export class EmpleadosService {
  constructor(
    @Inject(forwardRef(() => AsistenciasService)) private asistenciasService: AsistenciasService,
    @InjectModel('Empleado') private readonly empleadoModel: Model<EmpleadoDocument>,
    private readonly vistasService: VistasService,
    private readonly cargosService: CargosService,
    private readonly tiposService: TipoempleadosService,
    private readonly zonasService: ZonasService,
    private readonly redisService: RedisService
  ) {}
  //funcion que trae todos los usuarios activos para la asistencia
  async buscarUsuariosActivos(): Promise<Empleado[]> {
    return this.empleadoModel.find({ estado_empresa: { $ne: estadosEmpresa.INACTIVO } }).select("-usuario");
  };

  async buscarPorId(id:any) {
    return await this.empleadoModel.findById(id).populate("cargo", "_id nivel").exec()
  };

  async buscarMuchosId(ids:string[]) {
    return await this.empleadoModel.find({_id: { $in: ids }});
  };
  
  //funcion para buscar el usuario y validarlo antes del servicio login 
  async buscarUsuario(password:string, username:string): Promise<Empleado> {    
    return await this.empleadoModel.findOne({ 
      $or: [
        { 'usuario.email': username },
        { 'carnet': username} 
      ]
    }).populate('cargo zonas area tipo_empleado', 'nombre ruta nodos').then( async(data) => {
      if (!data) throw ({username: "Email o carnet incorrecto"});
      const isMatch = await bcrypt.compare(password, data.usuario.password);
      if (isMatch) {
        return data;
      } else {
        throw ({password: "Contraseña incorrecta"});
      }
    })
  };
  //funcion para traer las vistas del usuario en la sesión
  async buscarVistas(id:string): Promise<Empleado> {
    return this.empleadoModel.findById(id).select("vistas nombre").populate("vistas", "titulo ruta");
  };
  //----------------------------------METODOS GET-----------------------------------------------------------------------
  //funcion para traer el perfil del usuario
  async perfilUsuario(id:string):Promise<Empleado> {
    return await this.empleadoModel.findById(id).select({
      usuario: {
        email: 1,
        imagen: 1
      },
      nombre: 1,
      apellidos: 1,
      fecha_nacimiento: 1,
      tipo_documento: 1,
      numero_documento: 1,
      nacionalidad: 1
    })
  };
  //buscar el detalle del usuario
  async buscarDetalleEmpleado(id:string):Promise<Empleado> {
    return await this.empleadoModel.findById(id).select('-usuario');
  };
  //listar todo
  async listarTodo() {
    return await this.empleadoModel.find().populate("contrata cargo vistas", 'titulo ruta nombre').select('-usuario')
  };
  //tabla de lista de personal para la tabla principal
  async listarPersonal(nivel:number) {
    let query = {}

    if (nivel === niveles.SISTEMAS) {
      query = {};
    } else if (nivel > niveles.SISTEMAS && nivel < niveles.JEFES_MINI_PERSONAL) {
      query = { "nivel": { $gt: nivel } }
    } else {
      throw new HttpException({ message: 'No cuentas con los permisos necesarios.' }, HttpStatus.FORBIDDEN)
    };

    return await this.empleadoModel.find(query)
      .select({
        "usuario.email": 1,
        nombre: 1,
        apellidos: 1,
        carnet: 1,
        contrata:1,
        cargo: 1,
        nivel: 1,
        tipo_empleado: 1,
        area: 1,
        zona: 1,
        fecha_nacimiento: 1,
        numero_documento: 1,
        tipo_documento: 1,
        fecha_ingreso: 1,
        nacionalidad: 1,
        observacion: 1,
        estado_empresa: 1
      }).populate("cargo tipo_empleado area zonas contrata", "nombre nivel").sort(" nivel");
  };
  //listar los empleados asignados dependiendo del field
  async listarPersonalAsignado(id:string, field:string, area:any, nivelUsuario?:number) {
    let fieldAceptados = ["gestor","auditor","supervisor","contrata"];

    if (fieldAceptados.includes(field)) {
      return await this.empleadoModel.find({
        $and: [
          { [field]: id },
          { area: area  },
          { nivel: { $gte: nivelUsuario } }
        ]
      }).select({
        usuario: {
          email: 1,
        },
        nombre: 1,
        apellidos: 1,
        cargo: 1,
        tipo_empleado: 1,
        area: 1,
        zona: 1,
        carnet: 1,
        contrata:1,
        estado_empresa: 1
      }).populate("tipo_empleado area zona contrata", "nombre").populate("cargo", 'nombre nivel');
    } else {
      throw new HttpException('No cuentas con los permisos necesarios.', HttpStatus.FORBIDDEN)
    };
  };
  //listar jefes de contrata 
  async listarJefeContrata(contrata:any) {
    return await this.empleadoModel.find({ 
      $and: [
        { contrata: { $ne: contrata } },
        { nivel: niveles.JEFES_MINI_PERSONAL }
      ]
    }).select('nombre apellidos')
  };
  //funcion para traer los auditores para la lista del select de las tablas 
  async listarAuditores(zonas:string[]): Promise<Empleado[]> {
    return await this.redisService.get(redisKeys.AUDITORES).then(async(aduditores:string) => {
      if (aduditores) {
        const jsonAuditores:Array<any> = JSON.parse(aduditores);

        return jsonAuditores.filter((e) => e && e.zonas && e.zonas.length > 0 && e.zonas.some((zona:Zona) => zonas.includes(zona._id)));
      } else {
        const cargo = await this.cargosService.buscarCargoNombre(tiposUsuarios.AUDITOR);
        
        if (!cargo) throw new HttpException("No se encontró auditores disponibles.", HttpStatus.NOT_FOUND);

        return await this.empleadoModel.find({
          cargo: cargo._id,
          estado_empresa: { $ne: estadosEmpresa.INACTIVO }
        }).select('nombre apellidos carnet zonas area').sort('nombre').populate('zonas', "_id").then(async(data) => {
          const string = JSON.stringify(data);

          await this.redisService.set(redisKeys.AUDITORES, string, 86400);
          
          return data.filter((e) => e && e.zonas && e.zonas.length > 0 && e.zonas.some((zona:Zona) => zonas.includes(String(zona._id))));
        })
      };
    });
  };
  //funcion para traer los supervisores para la lista del select de las tablas 
  async listarSupervisores(nivel:number, zonas:string[], area:any): Promise<Empleado[]> {
    const filtros = (e:Empleado) => (e && e.zonas && e.area == area && e.zonas.length > 0 && e.zonas.some((zona:Zona) => zonas.includes(String(zona._id))));
    const cargo = await this.cargosService.buscarCargoNombre(tiposUsuarios.SUPERVISOR);
    
    if (!cargo) throw new HttpException("No se encontró supervisores disponibles.", HttpStatus.NOT_FOUND);

    return await this.empleadoModel.find({
      cargo: cargo._id,
      estado_empresa: { $ne: estadosEmpresa.INACTIVO }
    }).select('nombre apellidos carnet zonas contrata').sort('nombre').populate('zonas contrata', 'nombre nodos').then(async(data) => {
      if (nivel <= niveles.JEFES_MINI_PERSONAL) {
        return data;
      } else {
        return data.filter((e) => filtros(e));
      }
    });
  };
   //funcion para traer los gestores para la lista del select de las tablas 
  async listarGestores(nivel:number, zonas:string[], area:any): Promise<Empleado[]> {
    const filtros = (e:Empleado) => (e && e.zonas && e.area == area && e.zonas.length > 0 && e.zonas.some((zona:Zona) => zonas.includes(String(zona._id))));
    // const tipoOperativo = await this.tiposService.buscarNombre("operativo");
    return await this.redisService.get(redisKeys.GESTORES).then(async(gestores:string) => {
      if (gestores) {
        let jsonGestores:Array<any> = JSON.parse(gestores);
        
        if (nivel === niveles.ASIGNADOS) {
          return jsonGestores.filter((e) => e.carnet === "LY0771")
        } else if (nivel < niveles.JEFES_AREA) {
          return jsonGestores;
        } else {
          return jsonGestores.filter((e) => filtros(e));
        };
      } else {
        const cargo = await this.cargosService.buscarCargoNombre(tiposUsuarios.GESTOR);
        
        if (!cargo) throw new HttpException("No se encontró gestores disponibles.", HttpStatus.NOT_FOUND);

        return await this.empleadoModel.find({
          cargo: cargo._id,
          estado_empresa: { $ne: estadosEmpresa.INACTIVO },
          // tipo_empleado: tipoOperativo._id
        }).select('nombre apellidos carnet zonas area tipo_empleado').sort('nombre').populate('zonas').then(async(data) => {
          const string = JSON.stringify(data);

          await this.redisService.set(redisKeys.GESTORES, string, 86400)
          
          if (nivel === niveles.ASIGNADOS) {
            return data.filter((e) => e.carnet == "LY0771")
          } else if (nivel < niveles.JEFES_AREA){
            return data;
          } else {
            return data.filter((e) => filtros(e));
          }
        });
      };
    });
  };
  //lista para mostrar los tecnicos en la lista de rutas, ordenes y logistica
  async listarTecnicosGlobal(nivel:number, area:any, zonas:string[]): Promise<Empleado[]> {
    const cargo = await this.cargosService.buscarCargoNombre(tiposUsuarios.TECNICO);
    const zona = await this.zonasService.buscarZonaNombre("LIMA");
    let query = {}

    if (nivel < niveles.JEFES_AREA) {
      query = {
        nivel: niveles.OPERATIVO, 
        cargo: cargo.id,
        estado_empresa: { $ne: estadosEmpresa.INACTIVO }
      }
    } else {
      query = {
        area,
        nivel: niveles.OPERATIVO, 
        cargo: cargo.id,
        estado_empresa: { $ne: estadosEmpresa.INACTIVO },
        zonas: { $in: zonas }
      }
    }
   
    return await this.empleadoModel.find(query)
      .populate('gestor auditor supervisor contrata zonas', 'nombre apellidos nodos')
      .select('nombre apellidos gestor auditor supervisor contrata area zonas carnet tipo_negocio sub_tipo_negocio')
      .sort('contrata nombre')
      // .then(async(data) => {
      //   if (nivel < niveles.JEFES_AREA) {
      //     return data
      //   } else {
      //     return data.filter((e) => e && e.zonas && e.zonas.length > 0 && e.zonas.some((zona:Zona) => zonas.includes(String(zona._id))))
      //   }
      // });
  };
  //lista de tecnicos del gestor
  async listarTecnicosGestor(gestor:any):Promise<Empleado[]> {
    return await this.empleadoModel.find({
      gestor,
      estado_empresa: { $ne: estadosEmpresa.INACTIVO }
    }).populate('auditor supervisor contrata', 'nombre apellidos')
      .select('nombre apellidos auditor supervisor contrata carnet tipo_negocio sub_tipo_negocio')
      .sort('nombre')
  };
  //listar semilleros y choferes
  async listarTecnicosApoyo(nivel:number, area:string, zonas:string[]): Promise<Empleado[]> {    
    return await this.empleadoModel.find({
      nivel: niveles.INACTIVOS,
      estado_empresa: { $ne: estadosEmpresa.INACTIVO }
    }).select('nombre apellidos tecnico cargo area zonas')
      .populate('tecnico cargo', 'nombre apellidos carnet')
      .sort('nombre').then(async(data) => {
        if (nivel < niveles.JEFES_AREA) {
          return data
        } else {
          return data.filter((e) => {            
            return e && e.area && String(e.area) === area && e.zonas && e.zonas.length > 0 && e.zonas.some((z) => zonas.includes(String(z)))
          })
        }
      });
  };
  //cargar las columnas del gestor
  async obtenerColumnasGestor(user:string): Promise<Empleado> {
    return await this.empleadoModel.findById(user).select('columnas');
  };
  //----------------------------------METODOS PATCH-----------------------------------------------------------------------
  //guardar las preferencias de las columnas mostradas
  async actualizarColumnasGestor(user:string, columnas: string[]) {
    return await this.empleadoModel.findByIdAndUpdate(user, { columnas }).select('columnas')
  };
  //funcion para cambiar de contraseña
  async cambiarContraseña(id:string, password:string, newPassword1:string, newPassword2:string) {

    if (newPassword1 !== newPassword2) throw new HttpException('Las contraseñas no coinciden.', HttpStatus.INTERNAL_SERVER_ERROR);

    const empleado:Empleado = await this.empleadoModel.findById(id);

    if (empleado) {      
      const isMatch = await bcrypt.compare(password, empleado.usuario.password);
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword1, salt);
        return await this.empleadoModel.findByIdAndUpdate(id, { "usuario.password": hash })
      } else {
        throw new HttpException('Contraseña incorrecta.', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } else {
      throw new HttpException('Usuario no encontrado.', HttpStatus.INTERNAL_SERVER_ERROR);
    };
  };
  //funcion que actualiza la contraseña del toa
  async actualizarPassToa(id:string, password):Promise<Empleado> {
    return this.empleadoModel.findByIdAndUpdate(id, { $set: { "usuario.toa_pass": password } })
  };
  //funcion para resetar la contraseña 
  async resetPassword(id: string, nivel: number): Promise<Empleado> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('12345678', salt);
    
    return await this.empleadoModel.findOneAndUpdate({
      $and: [
        { id }, { nivel: { $gte: nivel } } 
      ]}, { $set: {'usuario.password': hash}})
  };
  //funcion para cerrar la sesión
  async cerrarSession(id: string): Promise<any> {
    return await this.redisService.remove(String(id));
  };
  //actualizar cargo del usuario
  async actualizarPermisos(_id: string, area:string, nivelUsuario:number, nuevoCargo: string, nuevoTipo:any): Promise<Empleado> {
    const cargo = await this.cargosService.buscarCargo(nuevoCargo);

    const nuevasVistas = await this.vistasService.buscarVistas(area, nuevoTipo, nuevoCargo)

    if (nivelUsuario < cargo.nivel) {
      await this.redisService.remove(redisKeys.AUDITORES);
      await this.redisService.remove(redisKeys.GESTORES);

      return this.empleadoModel.findByIdAndUpdate(_id, { 
        $set: { 
          cargo: cargo._id,
          nivel: cargo.nivel,
          tipo_empleado: nuevoTipo,
          vistas: nuevasVistas.map((e) => e._id)
        }
      });
    } else {
      throw new HttpException("No cuentas con los permisos necesarios.", HttpStatus.UNAUTHORIZED);
    };
  };
  //activar cuenta del usuario
  async activarCuenta(_id: string, nivel:number): Promise<Empleado> {
    return this.empleadoModel.findOneAndUpdate({_id, nivel: { $gte: nivel }}, { 
      $set: { 
        'usuario.activo': true, 
        estado_empresa: estadosEmpresa.ACTIVO, 
        fecha_baja: null 
      } 
    })
  };
  //editar estado de la empresa
  async editarEstadoEmpresa(_id:string, nivel:number, estado_e:number, fecha_baja?:Date): Promise<Empleado> {
    //declarar un obj para enviar los datos de actualizacion
    let objUpdate = {};
    //validar que estado se actualizará para cambiar el obj a enviar
    if (estado_e === 3) {
      objUpdate = {
        estado_empresa: estadosEmpresa.INACTIVO,
        fecha_baja, 'usuario.activo': false
      };
    } else if (estado_e === 2) {
      objUpdate = {
        estado_empresa: estadosEmpresa.SUSPENDIDO,
        fecha_baja, 'usuario.activo': false
      };
    } else {
      objUpdate = {
        estado_empresa: estadosEmpresa.ACTIVO,
        fecha_baja: null,
        'usuario.activo': true
      }
    };
    //actualizar el empleado
    return this.empleadoModel.findOneAndUpdate({_id, nivel: { $gte: nivel }}, objUpdate).then(async(data) => {
      await this.redisService.remove(redisKeys.AUDITORES);
      await this.redisService.remove(redisKeys.GESTORES);
        return data;
    });
  };
  //funcion para asignar nuevo gestor al tecnico
  async actualizarRuta(tecnicos:string[], auditor:any, supervisor:any, gestor:any, tecnico:any, negocio:string, subNegocio:string): Promise<number> {
    let objUpdate:any = {};

    if (auditor) objUpdate["auditor"] = auditor;
    if (supervisor) objUpdate["supervisor"] = supervisor;
    if (gestor) objUpdate["gestor"] = gestor;
    if (tecnico) objUpdate["tecnico"] = tecnico;
    if (negocio) objUpdate["tipo_negocio"] = negocio;
    if (subNegocio) objUpdate["sub_tipo_negocio"] = subNegocio;

    return await this.empleadoModel.updateMany({_id: { $in: tecnicos } }, objUpdate)
      .then(async (res) => await this.asistenciasService.actualizarEmpleadoAsistencia(tecnicos).then(() => res.nModified))
  };
  //funcion para agregar vistas
  async actualizarVista(empleados:any[], vistas:any[]) {
    return this.empleadoModel.updateMany({_id: { $in: empleados } }, { $push: { vistas: { $each: vistas } } })
  };
  //----------------------------------METODOS POST-----------------------------------------------------------------------
  //funcion para crear el empleado
  async crearEmpleado(createEmpleadoDto:CreateEmpleadoDto, email: string):Promise<Empleado> {
    const cargoActual = await this.cargosService.buscarCargo(createEmpleadoDto.cargo);
    const vistasDefault = await this.vistasService.buscarVistas(createEmpleadoDto.area, createEmpleadoDto.tipo_empleado, createEmpleadoDto.cargo)
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('12345678', salt);

    if (cargoActual) createEmpleadoDto.nivel = cargoActual.nivel;
    createEmpleadoDto.vistas = vistasDefault;

    const nuevoEmpleado = new this.empleadoModel({
      ...createEmpleadoDto,
      usuario: { email, password: hash}
    });

    await this.redisService.remove(redisKeys.AUDITORES);
    await this.redisService.remove(redisKeys.GESTORES);

    return await nuevoEmpleado.save();
  };
  //----------------------------------METODOS PUT-----------------------------------------------------------------------
  //funcion para actualizar el empleado
  async actualizarEmpleado(id: string, nivel: number, updateEmpleadoDto: UpdateEmpleadoDto, email:string) {
    const empleado = await this.empleadoModel.findById(id).select('nivel cargo');
    const nuevasVistas = await this.vistasService.buscarVistas(updateEmpleadoDto.area, updateEmpleadoDto.tipo_empleado, empleado.cargo._id);

    delete updateEmpleadoDto["usuario"];
    delete updateEmpleadoDto["nivel"];
    delete updateEmpleadoDto["cargo"];

    let objUpdate = updateEmpleadoDto;

    if (email) objUpdate["usuario.email"] = email;
    if (nuevasVistas) objUpdate["vistas"] = nuevasVistas;
    
    //validar que el usuario a actualizar no es uno de los jefes o administrador
    if (empleado && empleado.nivel > nivel) {
      await this.redisService.remove(redisKeys.AUDITORES);
      await this.redisService.remove(redisKeys.GESTORES);
      
      return await this.empleadoModel.findByIdAndUpdate(id, { $set: objUpdate });
    } else {
      throw new HttpException({
        message: 'No puedes editar usuarios con cargos superiores.'
      }, HttpStatus.FORBIDDEN)
    }
  };
};
