import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TipoEmpleadoDocument = Tipoempleado & Document;

@Schema({ timestamps: true })
export class Tipoempleado extends Document{
  @Prop({
    trim: true,
    uppercase: true,
    unique: true
  })
  nombre: string;

  @Prop({
    trim: true,
    uppercase: true,
    required: true,
    unique: true,
  })
  acron: string;
};

export const TipoempleadoSchema = SchemaFactory.createForClass(Tipoempleado);