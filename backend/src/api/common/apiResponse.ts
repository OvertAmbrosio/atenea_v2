import { Express } from 'express'

export const tipoStatus = {
  SUCCESS: 'success',
  WARN: 'warn',
  ERROR: 'error'
};

export type TRespuesta = {
  readonly status: string,
  readonly message: string,
  readonly data?: Array<any> | any
};

export type TErrorsLogin = {
  readonly username?: string,
  readonly message?: string,
  readonly password?: string,
};

export type TPayload = {
  readonly nombre?: string,
  readonly _id?: string,
  // readonly gestor: string,
  readonly contrata?: string,
  readonly cargo?: string,
  readonly cargo_nombre?: string,
  readonly nivel?: number,
  readonly area?: string,
  readonly zonas?: string[],
  readonly nodos?: string[],
  readonly imagen?: string,
  readonly dia?: number,
};

export type TPatchData = {
  id?: string, 
  metodo?: string, 
  nivel?: number, 
  cargo?: string, 
  tipo?:string,
  fecha_baja?: Date, 
  estado_empresa?: number, 
  auditor?: string,
  supervisor?: string,
  gestor?: string,
  tecnico?: string,
  negocio?: string,
  subNegocio?: string,
  tecnicos?: string[],
  empleados?: string[],
  password?: string,
  newPassword1?: string,
  newPassword2?: string,
  passToa: string,
  columnas?: string[],
  vistas?:string[]
};