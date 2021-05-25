import { estadosToa } from "../constants/valoresToa";

export const IOrdenesToa = {
  "actividad gpon": "actividad gpon",
  "bucket inicial": "bucket inicial",
  "categoria de capacidad": "categoria de capacidad",
  "codigo de cliente": "codigo de cliente",
  "codigo de requerimiento": "codigo de requerimiento",
  "estado actividad": "estado actividad",
  "estado de certificacion de toolbox": "estado de certificacion de toolbox",
  "fecha de cita": "fecha de cita",
  /**
   * @param {string} 'fecha de registro legados' -13/04/21 01:01 PM
   */
  "fecha de registro legados": "fecha de registro legados",
  "fecha hora de cancelacion": "fecha hora de cancelacion",
  /**
   * @param {string} hora_de_pre_no_realizado_tecnico - 2021-04-14 09:50
   */
  "hora_de_pre_no_realizado_tecnico": "hora_de_pre_no_realizado_tecnico",
  "localidad": "localidad",
  "motivo de suspension": "motivo de suspension",
  "motivo no realizado": "motivo no realizado",
  "motivo no realizado instalacion": "motivo no realizado instalacion",
  "nodo": "nodo",
  "nombre distrito": "nombre distrito",
  "numero ot": "numero ot",
  "sla fin": "sla fin",
  "sla inicio": "sla inicio",
  "subtipo de actividad": "subtipo de actividad",
  "tecnico": "tecnico",
  "time slot": "time slot",
  "tipo de cita": "tipo de cita",
  "usuario - no realizado": "usuario - no realizado",
  "usuario completar": "usuario completar",
  "usuario de cierre": "usuario de cierre",
}

export const TOrdenesToa = {
  "actividad gpon": String,
  "bucket inicial": String,
  "categoria de capacidad": String,
  "codigo de cliente": String,
  "codigo de requerimiento": String,
  "estado actividad": String,
  "estado de certificacion de toolbox": String,
  "fecha de cita": String,
  "fecha de registro legados": String,
  "fecha hora de cancelacion": String,
  "hora_de_pre_no_realizado_tecnico": String,
  "localidad": String,
  "motivo de suspension": String,
  "motivo no realizado": String,
  "motivo no realizado instalacion": String,
  "nodo": String,
  "nombre distrito": String,
  "numero ot": String,
  "sla fin": String,
  "sla inicio": String,
  "subtipo de actividad": String,
  "tecnico": String,
  "time slot": String,
  "tipo de cita": String,
  "usuario - no realizado": String,
  "usuario completar": String,
  "usuario de cierre": String,
} 

/**
 * @param {TOrdenesToa[]} data 
 */
export function separarBucket(data=[]) {
  let buckets = [];
  if (data && data.length !== 0) {
    let estados = [];
    let newData = [];
    data.forEach((o) => !buckets.includes(o["bucket inicial"]) ? buckets.push(o["bucket inicial"]): null);
    data.forEach((o) => !estados.includes(o["estado actividad"]) ? estados.push(o["estado actividad"]): null);
    buckets.forEach((b) => {
      estados.forEach((e) => {
        let numOrdenes = data.filter((o) => o["bucket inicial"] === b && o["estado actividad"] === e).length;
        newData.push({
          bucket: String(b.replace(/BK_|MA_|MR_|SM_|SV_|SJ_|PN_|VN_/g, "")).replace(/_|#|-|@|<>/g, " "),
          estado: e,
          ordenes: numOrdenes,
        });
      })
    });
    return {ordenes: newData, buckets, estados};
  } else {
    return {ordenes: [], buckets, estados: []} ;
  };
};

/**
 * @param {TOrdenesToa[]} data 
 */
export function separarContrata(data=[]) {
  let contratas = [];
  if (data && data.length !== 0) {
    let estados = [];
    let newData = [];
    try {
      data.forEach((o) => {
        if (o && o.contrata && o.contrata.nombre) {
          if (!contratas.includes(o.contrata.nombre)) contratas.push(o.contrata.nombre)
        }
      });
      data.forEach((o) => !estados.includes(o["estado actividad"]) ? estados.push(o["estado actividad"]): null);
      contratas.forEach((g) => {
        estados.forEach((e) => {
          let numOrdenes = data.filter((d) => {
            if (d.contrata && d.contrata.nombre){
              return d.contrata.nombre === g && d["estado actividad"] === e
            } else {
              return false;
            }
          }).length;
          newData.push({
            contrata: g,
            estado: e,
            ordenes: numOrdenes,
          });
        })
      });
      return {ordenes: newData, contratas};
    } catch (error) {
      console.log(error);
      return {ordenes: [], contratas} ;
    };    
  } else {
    return {ordenes: [], contratas} ;
  };
};

/**
 * @param {TOrdenesToa[]} data 
 */
export function separarGestor(data=[]) {
  let gestores = [];
  if (data && data.length !== 0) {
    let estados = [];
    let newData = [];
    data.forEach((o) => {
      if (o.gestor && o.gestor.nombre) {
        if (!gestores.includes(o.gestor.nombre)) gestores.push(o.gestor.nombre)
      }
    });
    data.forEach((o) => !estados.includes(o["estado actividad"]) ? estados.push(o["estado actividad"]): null);
    gestores.forEach((g) => {
      estados.forEach((e) => {
        let numOrdenes = data.filter((d) => {
          if (d.gestor && d.gestor.nombre){
            return d.gestor.nombre === g && d["estado actividad"] === e
          } else {
            return false;
          }
        }).length;
        newData.push({
          gestor: g,
          estado: e,
          ordenes: numOrdenes,
        });
      })
    });
    return {ordenes: newData, gestores};
  } else {
    return {ordenes: [], gestores} ;
  };
};

/**
 * @param {TOrdenesToa[]} data 
 */
 export function separarSupervisor(data=[]) {
  let supervisores = [];
  if (data && data.length !== 0) {
    let estados = [];
    let newData = [];
    data.forEach((o) => {
      if (o.supervisor && o.supervisor.nombre) {
        if (!supervisores.includes(o.supervisor.nombre)) supervisores.push(o.supervisor.nombre)
      }
    });
    data.forEach((o) => !estados.includes(o["estado actividad"]) ? estados.push(o["estado actividad"]): null);
    supervisores.forEach((s) => {
      estados.forEach((e) => {
        let numOrdenes = data.filter((d) => {
          if (d.supervisor && d.supervisor.nombre){
            return d.supervisor.nombre === s && d["estado actividad"] === e
          } else {
            return false;
          }
        }).length;
        newData.push({
          supervisor: s,
          estado: e,
          ordenes: numOrdenes,
        });
      })
    });
    return {ordenes: newData, supervisores};
  } else {
    return {ordenes: [], supervisores} ;
  };
};

export function separarMotivo(data=[]) {
  let gestores = [];
  if (data && data.length !== 0) {
    let motivos = [];
    let newData = [];
    data.forEach((o) => {
      if (o.gestor && o.gestor.nombre) {
        if (!gestores.includes(o.gestor.nombre)) gestores.push(o.gestor.nombre)
      } else {
        if (!gestores.includes('-')) gestores.push('-')
      }
    });
    data.forEach((o) => !motivos.includes(o.motivo_no_realizado) ? motivos.push(o.motivo_no_realizado) : null);
    gestores.forEach((g) => {
      motivos.forEach((m) => {
        let numOrdenes = data.filter((d) => {
          if (d.gestor && d.gestor.nombre){
            return d.gestor.nombre === g && d.motivo_no_realizado === m
          } else {
            return false;
          }
        }).length;
        newData.push({
          gestor: g,
          descripcion: m,
          motivo: String(m).substr(9).replace(/-/g, ''),
          ordenes: numOrdenes,
        });
      })
    });
    return {ordenes: newData, gestores};
  } else {
    return {ordenes: [], gestores} ;
  };
};

export function ordenarResumen(data=[], tipo) {
  if (data && data.length > 0) {
    let tipos = [];
    let nuevaData = [];

    data.forEach((d) => { if (!tipos.includes(d[tipo])) tipos.push(d[tipo]) });

    tipos.filter((e) => e).forEach((e, i) => {
      if (nuevaData.length <= 0) {
        nuevaData = [{
          key: i,
          [tipo]: e,
          completado: data.filter((d) => d.estado === estadosToa.COMPLETADO && e === d[tipo]).length,
          iniciado: data.filter((d) => d.estado === estadosToa.INICIADO && e === d[tipo]).length,
          no_realizada: data.filter((d) => d.estado === estadosToa.NO_REALIZADA && e === d[tipo]).length,
          pendiente: data.filter((d) => d.estado === estadosToa.PENDIENTE && e === d[tipo]).length,
          suspendido: data.filter((d) => d.estado === estadosToa.SUSPENDIDO && e === d[tipo]).length,
          cancelado: data.filter((d) => d.estado === estadosToa.CANCELADO && e === d[tipo]).length,
          total: data.filter((d) => e === d[tipo]).length,
        }]
      } else {
        nuevaData.push({
          key: i,
          [tipo]: e,
          completado: data.filter((d) => d.estado === estadosToa.COMPLETADO && e === d[tipo]).length,
          iniciado: data.filter((d) => d.estado === estadosToa.INICIADO && e === d[tipo]).length,
          no_realizada: data.filter((d) => d.estado === estadosToa.NO_REALIZADA && e === d[tipo]).length,
          pendiente: data.filter((d) => d.estado === estadosToa.PENDIENTE && e === d[tipo]).length,
          suspendido: data.filter((d) => d.estado === estadosToa.SUSPENDIDO && e === d[tipo]).length,
          cancelado: data.filter((d) => d.estado === estadosToa.CANCELADO && e === d[tipo]).length,
          total: data.filter((d) => e === d[tipo]).length,
        })
      }
    })

    return nuevaData;
  } else {
    return [];
  }
};

export function ordenarResumenId(data=[], tipo) {
  if (data && data.length > 0) {
    let tipos = [];
    let nuevaData = [];

    data.forEach((d) => { if (!tipos.includes(d[tipo].nombre)) tipos.push(d[tipo].nombre) });

    tipos.filter((e) => e).forEach((e, i) => {
      if (nuevaData.length <= 0) {
        nuevaData = [{
          key: i,
          [tipo]: e,
          completado: data.filter((d) => d.estado === estadosToa.COMPLETADO && e === d[tipo].nombre).length,
          iniciado: data.filter((d) => d.estado === estadosToa.INICIADO && e === d[tipo].nombre).length,
          no_realizada: data.filter((d) => d.estado === estadosToa.NO_REALIZADA && e === d[tipo].nombre).length,
          pendiente: data.filter((d) => d.estado === estadosToa.PENDIENTE && e === d[tipo].nombre).length,
          suspendido: data.filter((d) => d.estado === estadosToa.SUSPENDIDO && e === d[tipo].nombre).length,
          cancelado: data.filter((d) => d.estado === estadosToa.CANCELADO && e === d[tipo].nombre).length,
          total: data.filter((d) => e === d[tipo].nombre).length,
        }]
      } else {
        nuevaData.push({
          key: i,
          [tipo]: e,
          completado: data.filter((d) => d.estado === estadosToa.COMPLETADO && e === d[tipo].nombre).length,
          iniciado: data.filter((d) => d.estado === estadosToa.INICIADO && e === d[tipo].nombre).length,
          no_realizada: data.filter((d) => d.estado === estadosToa.NO_REALIZADA && e === d[tipo].nombre).length,
          pendiente: data.filter((d) => d.estado === estadosToa.PENDIENTE && e === d[tipo].nombre).length,
          suspendido: data.filter((d) => d.estado === estadosToa.SUSPENDIDO && e === d[tipo].nombre).length,
          cancelado: data.filter((d) => d.estado === estadosToa.CANCELADO && e === d[tipo].nombre).length,
          total: data.filter((d) => e === d[tipo].nombre).length,
        })
      }
    })

    return nuevaData;
  } else {
    return [];
  }
};