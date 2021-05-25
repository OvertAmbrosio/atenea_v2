import { Schema, Prop, SchemaFactory, raw } from '@nestjs/mongoose';
import { Schema as SchemaType } from 'mongoose';
import { Contrata } from 'src/api/contratas/schema/contrata.schema';
import { Empleado } from 'src/api/empleados/schema/empleado.schema';

@Schema()
export class HistorialRegistro {
  @Prop({
    default: Date.now
  })
  fecha_entrada?: Date;

  @Prop({
    trim: true,
    lowercase: true,
    default: '-'
  })
  estado_orden?: string;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Contrata.name,
    default: null
  })
  contrata_modificado?: Contrata;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Empleado.name,
    default: null
  })
  empleado_modificado?: Empleado;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: Empleado.name,
    default: null
  })
  usuario_entrada?: Empleado;

  @Prop({
    trim: true,
    default: null,
  })
  codigo_ctr?: number;

  @Prop(raw({
    url: { type: String },
    public_id: { type: String }
  }))
  imagenes?: Record<string, string>;

  @Prop({ default: '-' })
  observacion?: string;

  @Prop({ required: true })
  grupo_entrada?: Number
};

export const HistorialRegistroSchema = SchemaFactory.createForClass(HistorialRegistro);