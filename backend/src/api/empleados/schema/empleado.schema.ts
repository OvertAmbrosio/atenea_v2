import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaType } from 'mongoose';

import { Usuario, UsuarioSchema } from './usuario.schema';
import { Contrata } from 'src/api/contratas/schema/contrata.schema';
import { estadosEmpresa } from 'src/enums';
import { Cargo } from 'src/api/cargos/schema/cargo.schema';
import { Tipoempleado } from 'src/api/tipoempleados/schema/tipoempleado.schema';
import { Area } from 'src/api/areas/schema/area.schema';
import { Zona } from 'src/api/zonas/schema/zona.schema';
import { Vista } from 'src/api/vistas/schema/vista.shema';

export type EmpleadoDocument = Empleado & Document;

@Schema({ timestamps: true })
export class Empleado extends Document {
  @Prop({ 
    type: UsuarioSchema
  })
  usuario: Usuario;

  @Prop({
    required: true,
  })
  nivel: number;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Cargo.name,
    required: true,
  })
  cargo: Cargo;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Tipoempleado.name,
    required: true,
  })
  tipo_empleado: Tipoempleado;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Area.name,
    required: true,
  })
  area: Area;

  @Prop({
    type: [{
      type: SchemaType.Types.ObjectId,
      ref: Zona.name
    }],
    required: true,
  })
  zonas: Zona[];

  @Prop({
    type: [{
      type: SchemaType.Types.ObjectId,
      ref: Vista.name
    }],
    required: true,
  })
  vistas: Vista[];

  @Prop({
    trim: true,
    uppercase: true,
    default: '-'
  })
  nombre: string;

  @Prop({
    trim: true,
    uppercase: true,
    default: '-'
  })
  apellidos: string;

  @Prop({
    uppercase: true,
    default: null
  })
  carnet: string;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Empleado.name,
    default: null
  })
  tecnico: SchemaType.Types.ObjectId;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Empleado.name,
    default: null
  })
  gestor: SchemaType.Types.ObjectId;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Empleado.name,
    default: null
  })
  auditor: SchemaType.Types.ObjectId;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Empleado.name,
    default: null
  })
  supervisor: SchemaType.Types.ObjectId;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Contrata.name
  })
  contrata: Contrata;

  @Prop({
    trim: true,
    lowercase: true,
    default: '-'
  })
  tipo_negocio: string;

  @Prop({
    trim: true,
    lowercase: true,
    default: '-'
  })
  sub_tipo_negocio: string;

  @Prop({
    default: Date.now(),
  })
  fecha_nacimiento: Date;

  @Prop({
    unique: true,
    default: null
  })
  numero_documento: string;

  @Prop({
    default: 'DNI',
    uppercase: true
  })
  tipo_documento: string;

  @Prop({
    default: null,
  })
  numero_celular: string;

  @Prop({
    default: Date.now()
  })
  fecha_ingreso: Date;

  @Prop()
  fecha_baja: Date;

  @Prop({
    trim: true,
    default: estadosEmpresa.ACTIVO
  })
  estado_empresa: string;

  @Prop({
    trim: true,
    uppercase: true,
    default: 'PERUANA'
  })
  nacionalidad: string;

  @Prop({
    default: '-'
  })
  observacion: string;

  @Prop({
    trim: true,
    lowercase: true,
    default: null
  })
  columnas: Array<string>;
};

export const EmpleadoSchema = SchemaFactory.createForClass(Empleado);
