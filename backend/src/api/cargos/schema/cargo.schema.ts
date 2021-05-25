import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CargoDocument = Cargo & Document;

@Schema({ timestamps: true })
export class Cargo extends Document {
  @Prop({
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  })
  nombre: string;

  @Prop({
    required: true
  })
  nivel: number;
};

export const CargoSchema = SchemaFactory.createForClass(Cargo);