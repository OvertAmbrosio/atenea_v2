import { restPrivate } from './requestHelper';

export const getOrdenes = async (toast, {metodo, tipo, bandeja, nodos, requerimiento, cliente, fechaInicio, fechaFin, codigo, field, limite }) => restPrivate({
  url: 'ordenes', method: 'GET', params: { metodo, tipo, bandeja, nodos, requerimiento, cliente, fechaInicio, fechaFin, codigo, field, limite }, headers: { "Content-Type": "application/json" }
}, toast);

export const getOrdenesExportar = async (toast, {metodo, todo, tipo, nodos, ordenes }) => restPrivate({
  url: 'ordenes/exportar', method: 'GET', params: { metodo, todo, tipo, nodos, ordenes }, headers: { "Content-Type": "application/json" }
}, toast);

export const getOrdenesIndicadores = async (toast, {metodo, zona, negocio }) => restPrivate({
  url: 'ordenes/indicadores', method: 'GET', params: { metodo, zona, negocio }, headers: { "Content-Type": "application/json" }
}, toast);

/**
 * @param {object} body
 * @param {string} body.metodo
 * @param {array} body.ordenes
 */
export const postOrdenes = async ({metodo, ordenes, orden}) => restPrivate({
  url: 'ordenes', method: 'POST', data: { metodo, ordenes, orden}
},true);

export const putOrdenes = async ({metodo, ordenes}) => restPrivate({
  url: 'ordenes', method: 'PUT', data: { ordenes, metodo }
},true);

/**
 * @param {object} data
 * @param {string} data.metodo
 * @param {object} data.data
 * @param {array} data.data.ordenes
 * @param {string} data.data.tecnico
 * @param {string} data.data.gestor 
 * @param {string} data.data.contrata 
 * @param {string} data.data.observacion
 */
export const patchOrdenes = async ({metodo, data}) => restPrivate({
  url: 'ordenes', 
  method: 'PATCH', 
  data: { metodo, data}
},true);

export const patchFilesOrdenes = async (data) => restPrivate({
  url: 'ordenes', 
  method: 'PATCH', 
  data, 
  headers: { 'Content-Type': 'multipart/form-data' }
}, true)