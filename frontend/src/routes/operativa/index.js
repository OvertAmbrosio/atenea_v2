import listaRutas from './listaRutas';
import gestionarAsistencia from './gestionarAsistencia';
import administrarOrdenes from './administrarOrdenes';
import { rutas } from '../../constants/listaRutas';
import BuscarOrden from '../../views/Operativa/BuscarOrden';

const rutasOperativa = [
  {
    path: rutas.buscarOrdenes,
    exact: true,
    component: BuscarOrden
  },
  ...listaRutas,
  ...gestionarAsistencia,
  ...administrarOrdenes
];

export default rutasOperativa;