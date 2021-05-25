import React from 'react';

import TituloContent from '../../components/common/TituloContent';
import Contenedor from '../../components/common/Contenedor';
import BuscarOrdenes from '../../components/operativa/BuscarOrden';

export default function BuscarOrden() {
  return (
    <div>
      <TituloContent titulo="Buscar Orden" subtitulo="Operativa"/>
      <Contenedor>
        <BuscarOrdenes/>
      </Contenedor>
    </div>
  )
}
