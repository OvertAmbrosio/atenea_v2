export const tiposOrden = {
  AVERIAS: 'averiashfc',
  ALTAS: 'altashfc',
  SPEEDY: 'speedy',
  BASICAS: 'basicas'
};

export const estadosToa = {
  CANCELADO: 'Cancelado',
  COMPLETADO: 'Completado',
  INICIADO: 'Iniciado',
  NO_REALIZADA: 'No Realizada',
  PENDIENTE: 'Pendiente',
  SUSPENDIDO: 'Suspendido'
};

export const estadoGestor = {
  PENDIENTE: 'pendiente',
  AGENDADO: 'agendado',
  ASIGNADO: 'asignado',
  INICIADO: 'iniciado',
  COMPLETADO: 'completado',
  LIQUIDADO: 'liquidado',
  SUSPENDIDO: 'suspendido',
  CANCELADO: 'cancelado',
  NO_REALIZADO: 'no_realizado',
  MASIVO: 'masivo',
  PEXT: 'pext',
  REMEDY: 'remedy',
  ANULADO: 'anulado',
  OBSERVADO: 'observado'
};

export const tiposLiquidacion = {
  ANULADA: 'N',
  LIQUIDADAS: 'Q'
};

export const bandejasLiteyca = {
  LITEYCA: 470,
  CRITICOS: 476,
  PEX: 472
};

export const bandejasTotal = [bandejasLiteyca.LITEYCA, bandejasLiteyca.CRITICOS, bandejasLiteyca.PEX];
export const bandejasRC = [bandejasLiteyca.LITEYCA, bandejasLiteyca.CRITICOS];