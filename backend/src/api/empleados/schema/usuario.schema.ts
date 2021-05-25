import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Usuario {
  @Prop({
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  })
  email: string;
  
  @Prop({
    required: true,
    trim: true
  })
  password: string;

  @Prop({
    default: null,
    trim: true
  })
  toa_pass: string;

  @Prop({
    trim: true,
    default: "https://res.cloudinary.com/liteyca/image/upload/v1613847803/avatars/stevie_g4dcxw.jpg"
  })
  imagen: string;
  //estado del usuario para validar el acceso al sistema,
  //un usuario puede estar activo en la empresa pero con el usuario
  //desactivado (vacaciones,fugas de seguridad, etc..)
  @Prop({
    default: true
  })
  activo: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);