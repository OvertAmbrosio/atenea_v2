import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AreaDocument = Area & Document;

@Schema({ timestamps: true })
export class Area extends Document {
  @Prop({
    unique: true,
    required: true,
    uppercase: true
  })
  nombre:string;

  @Prop({ default: '-' })
  descripcion:string;
};

export const AreaSchema = SchemaFactory.createForClass(Area);
