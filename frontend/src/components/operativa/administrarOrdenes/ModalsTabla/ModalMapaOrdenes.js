import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Rodal from 'rodal';

import MapaContenedor from '../mapa/MapaContenedor';
import MapaOpciones from '../mapa/MapaOpciones';

function ModalMapaOrdenes({abrir, visible, gestion, ordenes=[], nuevaData, setNuevaData}) {
  const [listaOrdenes, setlistaOrdenes] = useState([]);
  const [posicion, setPosicion] = useState([-12.0600269,-77.0763408])
  const [filtroContratas, setFiltroContratas] = useState([]);
  const [filtroGestores, setFiltroGestores] = useState([]);
  const [filtroTecnicos, setFiltroTecnicos] = useState([]);
  const [filtroEstados, setFiltroEstados] = useState([]);

  useEffect(() => {
    if (ordenes && ordenes.length > 0 && visible ) {
      setlistaOrdenes(ordenes)
    } else {
      setlistaOrdenes([]);
    }
  //eslint-disable-next-line
  },[visible]);

  useEffect(() => {
    if (listaOrdenes && listaOrdenes.length > 0) {
      setPosicion([parseFloat(listaOrdenes[0].direccion_polar_y),parseFloat(listaOrdenes[0].direccion_polar_x)]);
      cargarFiltros();
    }
  //eslint-disable-next-line
  },[listaOrdenes]);

  function ordenar(array=[]) {
    return array.sort((a,b) => {
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      };
    });
  };

  function cargarFiltros() {
    console.log("cargar filtros");
    let gestores = [];
    let contratas = [];
    let tecnicos = [];
    let estados = [];
    ordenes.forEach((orden) => {
      if (!gestion && orden.gestor && !gestores.includes(orden.gestor)) {
        gestores.push(orden.gestor);
      };
      if (!gestion && orden.contrata && !contratas.includes(orden.contrata)) {
        contratas.push(String(orden.contrata));
      };
      if (orden.tecnico && orden.tecnico && !tecnicos.includes(orden.tecnico)) {
        tecnicos.push(orden.tecnico);
      }
      if (!estados.includes(orden.estado_toa)) {
        estados.push(orden.estado_toa);
      }
    });
    if (!gestion) setFiltroContratas(ordenar(contratas));
    if (!gestion) setFiltroGestores(ordenar(gestores));
    setFiltroTecnicos(ordenar(tecnicos));
    setFiltroEstados(ordenar(estados));
  };

  function actualizarOrdenes() {
    setlistaOrdenes(ordenes);
    setNuevaData(false);
  };

  function filtrarOrdenes(array=[]) {
    setNuevaData(false);
    setlistaOrdenes(array)
  };

  return (
    <Rodal
      width="100vw" 
      height="100vh" 
      visible={visible} 
      onClose={abrir}
      showCloseButton={false}
      customStyles={{ padding: 0 }}
    >
      <div style={{ overflow: 'hidden' }}>
        { visible && listaOrdenes.length > 0 ? 
          <MapaContenedor gestion={gestion} posicion={posicion} listaOrdenes={listaOrdenes}/> 
          : null 
        }
        <MapaOpciones 
          gestion={gestion}
          abrir={abrir}
          ordenes={ordenes}
          nuevaData={nuevaData}
          actualizar={actualizarOrdenes}
          guardar={filtrarOrdenes}
          contratas={filtroContratas}
          gestores={filtroGestores}
          tecnicos={filtroTecnicos}
          estados={filtroEstados}
        />
      </div>
    </Rodal>
  )
};

ModalMapaOrdenes.propTypes = {
  abrir: PropTypes.func,
  visible: PropTypes.bool,
  gestion: PropTypes.bool,
  ordenes: PropTypes.array,
  nuevaData: PropTypes.bool,
  setNuevaData: PropTypes.func
};

export default ModalMapaOrdenes;


