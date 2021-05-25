import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { Empty } from 'antd';
import randomColor from 'randomcolor';

import MapaMarcador from './MapaMarcador';
import colores from '../../../../constants/colores';
import { getEmpleados } from '../../../../services/apiEmpleado';
import metodos from '../../../../constants/metodos';
import { getContratas } from '../../../../services/apiContrata';

function MapaContenedor({gestion, posicion=[], listaOrdenes=[]}) {
  const [listaContratas, setListaContratas] = useState([]);
  const [listaGestores, setListaGestores] = useState([]);
  const [listaTecnicos, setListaTecnicos] = useState([]);
  const [listaTecnicosColor, setListaTecnicosColor] = useState(null);

  useEffect(() => {
    cargarContratas();
    cargarGestores();
    cargarTecnicos();
  //eslint-disable-next-line
  }, [])

  useEffect(() => {
    console.log('renderiza');
    if (listaOrdenes.length < 50) {
      let tecnicos = [];
      listaOrdenes.forEach((e) => {
        if (!tecnicos.includes(e.tecnico)) {
          tecnicos.push(e.tecnico);
        }
      });
      setListaTecnicosColor(
        tecnicos.map(
          (e) => ({
            nombre: e, 
            color: e === '-' ? colores.warning : randomColor({luminosity: 'dark'})
          })
        )
      )
    } else {
      setListaTecnicosColor(null);
    };
  //eslint-disable-next-line
  },[listaOrdenes]);

  async function cargarContratas() {
    await getContratas(false, metodos.CONTRATA_LISTAR_NOMBRES)
      .then(({data}) => setListaContratas(data ? data : []))
      .catch((err) => console.log(err))
  };

  async function cargarGestores() {
    await getEmpleados(false, { metodo: metodos.EMPLEADOS_LISTAR_GESTORES } )
      .then(({data}) => setListaGestores(data ? data : []))
      .catch((err) => console.log(err))
  };

  async function cargarTecnicos() {
    await getEmpleados(false, { metodo: metodos.EMPLEADOS_LISTAR_TECNICOS } )
      .then(({data}) => setListaTecnicos(data ? data : []))
      .catch((err) => console.log(err))
  };

  if (listaOrdenes.length <= 0) {
    return (<Empty className="map-container" />)
  };

  return (
    <MapContainer
      center={posicion} 
      zoom={15} 
      scrollWheelZoom={true}
      className="map-container"
      style={{ bottom: 0 }}
      zoomAnimation={true}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="topright"/>
      {listaOrdenes.length < 50 && listaTecnicosColor && listaTecnicosColor.length > 0  ?
        listaOrdenes.map((orden) => {
          const color = listaTecnicosColor.filter((e) => e.nombre === orden.tecnico);
          return (
            <MapaMarcador
              gestion={gestion}
              key={orden.codigo_requerimiento}
              orden={orden}
              color={color && color.length > 0  ? color[0].color : colores.warning}
              contratas={listaContratas}
              gestores={listaGestores}
              tecnicos={listaTecnicos}
            />
          )
        })
       : listaOrdenes.map((orden) => (
          <MapaMarcador
            gestion={gestion}
            key={orden.codigo_requerimiento}
            orden={orden}
            contratas={listaContratas}
            gestores={listaGestores}
            tecnicos={listaTecnicos}
          />
        ))
      }
    </MapContainer>
  )
};

MapaContenedor.propTypes = {
  gestion: PropTypes.bool,
  posicion: PropTypes.array,
  listaOrdenes: PropTypes.array
};

export default React.memo(MapaContenedor);

