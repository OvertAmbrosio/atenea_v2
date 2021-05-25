import { restPrivate } from './requestHelper';

/**
 * @param {boolean} toast false si debe buscar sin mostrar avisos
 * @param {object} metodo
 * @param {string} metodo.metodo
 */
export const getEmpleados = async (toast, metodo) => restPrivate({
  url: 'empleados', method: 'GET', params: metodo
}, toast);

/**
 * @param {string} metodo 
 * @param {string} id 
 */
export const buscarEmpleado = async (metodo, id) => restPrivate({
  url: `empleados/${id}`, method: 'GET', params: { metodo }
}, true);

/**
 * 
 * @param {boolean} toast validar si mostrará avisos
 * @param {object} data
 * @param {string} data.id
 * @param {string} data.metodo el metodo
 * @param {number} data.cargo cargo a modificar
 * @param {number} data.tipo tipo a modificar
 * @param {Date} data.fecha_baja fecha de baja
 * @param {number} data.estado_empresa estado dentro de la empresa
 * @param {string} data.gestor
 * @param {string} data.auditor
 * @param {string} data.supervisor
 * @param {string} data.negocio
 * @param {string} data.subNegocio
 * @param {string} data.columnas
 * @param {Array} data.tecnicos
 * @param {Array} data.empleados
 * @param {string} data.tecnico
 * @param {array} data.vistas
 * @param {string} data.password
 * @param {string} data.newPassword1
 * @param {string} data.newPassword2
 * @param {string} data.passToa
 */
export const patchEmpleados = async (
  toast, { id, metodo, cargo, tipo, fecha_baja, estado_empresa, gestor, supervisor, auditor, negocio, subNegocio, columnas, tecnico, tecnicos, empleados, vistas, password, newPassword1, newPassword2, passToa }
) => restPrivate({
  url: 'empleados', 
  method: 'PATCH', 
  data: { id, metodo, cargo, tipo, fecha_baja, estado_empresa, gestor, supervisor, auditor, negocio, subNegocio, columnas, tecnico, tecnicos, empleados, vistas, password, newPassword1, newPassword2, passToa }
}, toast);


/**
 * @param {object} data
 * @param {string} data.metodo
 * @param {string} data.email
 * @param {object} data.empleado 
 */
export const postEmpleados = async ({metodo, email, empleado}) => restPrivate({
  url: 'empleados', method: 'POST', data: { metodo, email, empleado }
}, true);

/**
 * @param {string} id id del empleado
 * @param {object} data objeto a actualizar
 * @param {string} data.metodo
 * @param {string} data.email
 * @param {object} data.empleado
 */
export const putEmpleados = async (id, { metodo, email, empleado }) => restPrivate({
  url: 'empleados/' + id, method: 'PUT', data: { metodo, email, empleado }
}, true);

