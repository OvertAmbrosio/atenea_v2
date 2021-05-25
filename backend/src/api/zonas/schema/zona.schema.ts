import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ZonaDocument = Zona & Document;

@Schema({ timestamps: true })
export class Zona extends Document {
  @Prop({
    uppercase: true,
    unique: true,
    required: true
  })
  nombre: string;

  @Prop({
    uppercase: true,
  })
  nodos: Array<string>
};

export const ZonaSchema = SchemaFactory.createForClass(Zona);
