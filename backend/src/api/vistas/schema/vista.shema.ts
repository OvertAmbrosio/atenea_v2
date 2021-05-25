import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaType } from 'mongoose';
import { Area } from 'src/api/areas/schema/area.schema';
import { Cargo } from 'src/api/cargos/schema/cargo.schema';
import { Tipoempleado } from 'src/api/tipoempleados/schema/tipoempleado.schema';

export type VistaDocument = Vista & Document;

@Schema()
export class Vista extends Document {
  @Prop({
    required: true,
  })
  titulo: string;

  @Prop({
    unique: true,
    required: true
  })
  ruta: string;

  @Prop({
    type: [{ 
      type: SchemaType.Types.ObjectId, 
      ref: Cargo.name,
      unique: false
    }],
    unique: false
  })
  cargos: Cargo[];

  @Prop({
    type: [{
      type: SchemaType.Types.ObjectId,
      ref: Tipoempleado.name,
      unique: false
    }],
    unique: false
  })
  tipos_empleado: Tipoempleado[];

  @Prop({
    type: [{
      type: SchemaType.Types.ObjectId,
      ref: Area.name,
      unique: false
    }],
    unique: false
  })
  areas: Area[];
};

export const VistaSchema = SchemaFactory.createForClass(Vista);
