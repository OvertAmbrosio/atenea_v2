import { PartialType } from '@nestjs/mapped-types';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaType } from 'mongoose';
import { Cargo } from 'src/api/cargos/schema/cargo.schema';
import { Empleado } from 'src/api/empleados/schema/empleado.schema';
import { estadosAsistencia } from 'src/enums';

@Schema()
export class HistorialRegistro {
  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Empleado.name,
    default: null
  })
  usuario: Empleado;
  
  @Prop({ default: Date.now() })
  fecha_registro: Date;

  @Prop({
    trim: true,
    default: '-'
  })
  observacion: string;
};

export const HistorialRegistroSchema = SchemaFactory.createForClass(HistorialRegistro);

export type AsistenciaDocument = Asistencia & Document;

@Schema({ timestamps: true })
export class Asistencia extends Document {
  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Cargo.name,
    require: true
  })
  cargo: Cargo;

  @Prop({
    type: PartialType(Empleado),
    required: true
  })
  empleado: Empleado;

  @Prop({
    trime: true,
    uppercase: true,
    default: estadosAsistencia.FALTA
  })
  estado: string;

  @Prop({
    default: false
  })
  iniciado: boolean;

  @Prop({
    default: null
  })
  fecha_iniciado: Date;

  @Prop({
    default: null
  })
  fecha_asistencia: Date;

  @Prop({
    type: [{
      type: HistorialRegistroSchema
    }]
  })
  historial_registro: HistorialRegistro[]
};

export const AsistenciaSchema = SchemaFactory.createForClass(Asistencia);

