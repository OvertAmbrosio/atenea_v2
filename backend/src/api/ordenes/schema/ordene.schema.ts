import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaType } from 'mongoose';

import { Contrata } from 'src/api/contratas/schema/contrata.schema';
import { Empleado } from 'src/api/empleados/schema/empleado.schema';
import { estadoGestor } from 'src/enums';
import { HistorialRegistro, HistorialRegistroSchema } from './historial.schema';

export type OrdeneDocument = Ordene & Document;

@Schema({ timestamps: true })
export class Ordene extends Document {
  @Prop({
    required: true,
    trim: true,
  })
  tipo: string;

  @Prop({
    trim: true,
    default: '-'
  })
  codigo_zonal: string;

  @Prop({
    trim: true,
    required: true,
    unique: true
  })
  codigo_requerimiento: string;

  @Prop({
    trim: true,
    default: '-'
  })
  codigo_trabajo: string;

  @Prop({
    trim: true,
    default: '-'
  })
  codigo_peticion: string;

  @Prop({
    trim: true,
    default: '-'
  })
  codigo_cliente: string;

  @Prop({
    trim: true,
    default: '-'
  })
  nombre_cliente: string;

  @Prop({
    trim: true,
    default: null
  })
  codigo_ctr: number;

  @Prop({
    trim: true,
    default: '-'
  })
  descripcion_ctr: string;

  @Prop({
    trim: true,
    default: '-'
  })
  codigo_nodo: string;

  @Prop({
    trim: true,
    default: '-'
  })
  codigo_troba: string;

  @Prop({
    trim: true,
    default: '-'
  })
  codigo_incidencia: string;

  @Prop({
    trim: true,
    default: '-'
  })
  codigo_segmento: string;

  @Prop({
    trim: true,
    default: '-'
  })
  distrito: string;

  @Prop({
    trim: true,
    default: '-'
  })
  direccion: string;

  @Prop({
    trim: true,
    uppercase: true,
    default: '-'
  })
  direccion_avenida: string;

  @Prop({
    trim: true,
    default: '-'
  })
  codigo_motivo: string;

  @Prop({
    trim: true,
    default: '-'
  })
  detalle_motivo: string;

  @Prop({
    trim: true,
    default: '-'
  })
  tipo_requerimiento: string;

  @Prop({
    trim: true,
    default: '-'
  })
  indicador_pai: string;

  @Prop({
    trim: true,
    default: '-'
  })
  movistar_total: string;

  @Prop({
    trim: true,
    default: '-'
  })
  detalle_trabajo: string;

  @Prop({
    trim: true,
    default: '-'
  })
  telefono_contacto: string;

  @Prop({
    trim: true,
    default: '-'
  })
  telefono_referencia: string;

  @Prop({
    trim: true,
    default: '-'
  })
  numero_reiterada: string;

  @Prop({
    trim: true,
    default: '-'
  })
  tipo_tecnologia: string;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Ordene.name,
    default: null
  })
  infancia: SchemaType.Types.ObjectId;
  
  @Prop({ required: true })
  fecha_registro: Date;

  @Prop({ default: null })
  fecha_asignado: Date;
  
  //ESTADOS----------------------------------------------------------------
  @Prop({
    trim: true,
    lowercase: true,
    default: '-'
  })
  estado_toa: string;

  @Prop({
    trim: true,
    lowercase: true,
    default: estadoGestor.PENDIENTE
  })
  estado_gestor: string;

  @Prop({
    trim: true,
    lowercase: true,
    default: '-'
  })//asignado, enviado, aprobado, rechazado
  estado_tecnico: string;

  @Prop({
    trim: true,
    lowercase: true,
    default: '-'
  })//efectiva, inefectiva, no_corresponde
  estado_liquidado: string;
  //DATOS DE ASIGNACION ------------------------------------------------------
  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Empleado.name,
    default: null
  })
  tecnico: Empleado;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Empleado.name,
    default: null
  })
  tecnico_liteyca: Empleado;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Empleado.name,
    default: null
  })
  gestor: Empleado;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Contrata.name,
    default: null
  })
  contrata: Contrata;

  @Prop({
    trim: true,
    default: '-'
  })
  observacion_gestor: string;
  //DATOS DE LIQUIDACION ---------------------------------------------------
  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Empleado.name,
    default: null
  })
  tecnico_liquidado: Empleado;

  @Prop({
    trim: true,
    uppercase: true,
    default: '-'
  })
  nombre_liquidado: string;

  @Prop({ default: null })
  fecha_liquidado: Date;

  @Prop({
    trim: true,
    default: '-'
  })
  codigo_usuario_liquidado: string;

  @Prop({
    trim: true,
    uppercase: true,
    default: '-'
  })
  tipo_averia: string;

  @Prop({
    trim: true,
    default: '-'
  })
  observacion_liquidado: string;

  @Prop({
    trim: true,
    lowercase: true,
    default: '-'
  })
  descripcion_codigo_liquidado: string;
  //DATOS TOA-------------------------------------------------------------
  @Prop({
    trim: true,
    uppercase: true,
    default: '-'
  })
  bucket: string;

  @Prop({
    trim: true,
    default: '-'
  })
  subtipo_actividad: string;

  @Prop({
    trim: true,
    default: '-'
  })
  categoria_capacidad: string;

  @Prop({
    trim: true,
    default: null
  })
  fecha_cita: Date;

  @Prop({
    trim: true,
    default: null
  })
  fecha_cancelado: Date;

  @Prop({
    trim: true,
    default: null
  })
  tipo_agenda: string;

  @Prop({
    trim: true,
    lowercase: true,
    default: null
  })
  tipo_cita: string;

  @Prop({
    trim: true,
    default: '-'
  })
  motivo_no_realizado: string;

  @Prop({ default: null })
  sla_inicio: Date;

  @Prop({ default: null })
  sla_fin: Date;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Empleado.name,
    default: null
  })
  usuario_cierre: Empleado;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Empleado.name,
    default: null
  })
  usuario_completar: Empleado;

  @Prop({
    uppercase: true,
    default: null,
  })
  estado_indicador_prueba: string;

  @Prop({
    trim: true,
    default: '-'
  })
  observacion_toa: string;

  @Prop({
    trim: true,
    default: null
  })
  direccion_polar_x: string;

  @Prop({
    trim: true,
    default: null
  })
  direccion_polar_y: string;
  //REGISTROS EN EL SISTEMA
  @Prop({
    type: [{
      type: HistorialRegistroSchema
    }]
  })
  historial_registro: HistorialRegistro[]
};

export const OrdeneSchema = SchemaFactory.createForClass(Ordene);

