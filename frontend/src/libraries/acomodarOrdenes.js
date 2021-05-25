export function acomodarOrdenes(array=[]) {
  return array.filter((e) => e.direccion_polar_x).map((orden) => ({
    infancia: orden.infancia,
    reiterada: orden.numero_reiterada,
    codigo_requerimiento: orden.codigo_requerimiento,
    direccion_polar_x: orden.direccion_polar_x,
    direccion_polar_y: orden.direccion_polar_y,
    estado_toa: orden.estado_toa,
    subtipo_actividad: orden.subtipo_actividad,
    contrata: orden.contrata && orden.contrata.nombre ? orden.contrata.nombre : '-',
    gestor: orden.gestor && orden.gestor.nombre ? orden.gestor.nombre + ' ' + orden.gestor.apellidos : '-',
    tecnico: orden.tecnico_liteyca && orden.tecnico_liteyca.nombre ? orden.tecnico_liteyca.nombre + ' ' + orden.tecnico_liteyca.apellidos : '-'
  }))
};