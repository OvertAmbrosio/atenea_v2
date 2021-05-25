import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as SchemaType } from 'mongoose';

import { Zona } from 'src/api/zonas/schema/zona.schema';

export type ContrataDocument = Contrata & Document; 

@Schema({ timestamps: true })
export class Contrata extends Document {
  @Prop({ 
    trim: true, 
    required: true, 
    uppercase: true 
  })
  nombre: string;

  @Prop({ 
    type: [{
      type: Types.ObjectId,
      ref: Zona.name,
    }],
    default: []
  })
  zonas: Zona[];

  @Prop({ 
    trim: true, 
    uppercase: true,
    default: '-'
  })
  ruc: string;

  @Prop({
    type: SchemaType.Types.ObjectId,
    default: null
  })
  jefe: SchemaType.Types.ObjectId;

  @Prop({
    default: null,
    uppercase: true,
    trim: true
  })
  representante: string;

  @Prop({ default: Date.now() })
  fecha_incorporacion: Date;

  @Prop({ default: null })
  fecha_baja: Date;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ default: '-' })
  observacion: string;
};

export const ContrataSchema = SchemaFactory.createForClass(Contrata);
