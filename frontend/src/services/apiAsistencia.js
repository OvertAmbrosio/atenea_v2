import { restPrivate } from './requestHelper';

/**
 * @param {object} data 
 * @param {boolean} data.toast
 * @param {string} data.cargo
 * @param {Date} data.fechaInicio
 * @param {Date} data.fechaFin
 */
export const getAsistencias = async ({toast=true, metodo, cargo, fechaInicio, fechaFin}) => restPrivate({
  url: 'asistencias', method: 'GET', params: {metodo, cargo, fechaInicio, fechaFin}
}, toast);
/**
 * @param {object} data 
 * @param {string} data.metodo
 * @param {object} data.asistencia
 * @param {Date} data.asistencia.fecha
 * @param {string} data.asistencia.observacion
 * @param {string} data.asistencia.empleado
 * @param {string} data.asistencia.estado
 */
export const postAsistencias = async ({ metodo, asistencia }) => restPrivate({
  url: 'asistencias', method: 'POST', data: { metodo, asistencia }
}, true)

/**
 * @param {object} data 
 * @param {string} data.metodo
 * @param {object} data.asistencia
 * @param {string} data.asistencia._id
 * @param {string} data.asistencia.estado
 * @param {string} data.asistencia.observacion
 */
export const patchAsistencia = async ({metodo, asistencia}) => restPrivate({
  url: 'asistencias', method: 'PATCH', data: { metodo, asistencia }
}, true)