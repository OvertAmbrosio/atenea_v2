import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Select, Switch } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import cogoToast from 'cogo-toast';

import { socket } from '../../../../services/socket';
import TablaPendientes from './TablaPendientes';
import metodos from '../../../../constants/metodos';
import { estadosToa } from '../../../../constants/valoresToa';

const { Option } = Select;

const estadosCerrados = [estadosToa.COMPLETADO, estadosToa.NO_REALIZADA].map((e) => String(e).toLowerCase());

function Index({contratas=[], gestores=[], tecnicos=[], zonas=[], nodos=[], tipo}) {
  const [ordenesCerradas, setOrdenesCerradas] = useState([]);
  const [ordenesPendientes, setOrdenesPendientes] = useState([]);
  const [tipoEstado, setTipoEstado] = useState(true);
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);
  const [zonaConectada, setZonaConectada] = useState(null);

  useEffect(() => {
    socket.on(metodos.ORDENES_SOCKET_PENDIENTES, ({data}) => {
      console.log("data obtenida.");
      cogoToast.success("Base de datos actualizada.", { position: "bottom-left" });
      setOrdenesCerradas(data.filter((e) => estadosCerrados.includes(e.estado_toa)));
      setOrdenesPendientes(data.filter((e) => !estadosCerrados.includes(e.estado_toa)))
    });
    socket.on('mensajeParaAdministradores', (data) => {
      if (data && data.mensaje) {
        cogoToast.info(data.mensaje, { position: "bottom-left" })
      };
    });
    socket.on('disconnect', () => {
      console.log("desconectado por inactividad");
      cogoToast.loading("Reconectando al servidor...", { position: "bottom-left" });
      if (zonas.length === 1 ) {
        socket.emit(metodos.UNIR_SALA_PENDIENTES, {zona: zonas[0]._id, tipo});
      } else if (zonaSeleccionada) {
        socket.emit(metodos.UNIR_SALA_PENDIENTES, {zona: zonaSeleccionada, tipo});
      };      
    });
    return () => {
      console.log("Socket desconectado.");
      cogoToast.info("Sincronización finalizada.", { position: "bottom-left" })
      socket.emit(metodos.DEJAR_SALA_PENDIENTES);
      socket.off(metodos.ORDENES_SOCKET_PENDIENTES);
    };
  //eslint-disable-next-line
  },[]);

  useEffect(() => {
    if (zonas.length === 1) {
      console.log("conectando... ");
      cogoToast.loading("Conectando con el servidor...", { position: "bottom-left" })
      socket.emit(metodos.UNIR_SALA_PENDIENTES, {zona: zonas[0]._id, tipo});
    };
  //eslint-disable-next-line
  },[zonas]);

  async function conectarZona() {
    if (zonaSeleccionada === zonaConectada) return cogoToast.warn("Ya estas conectado a esa zona.", { position: 'top-right' });
    if (zonaSeleccionada && zonaSeleccionada !== zonaConectada) {
      console.log("conectando... ");
      //dejar la sala anterior
      socket.emit(metodos.DEJAR_SALA_PENDIENTES, {zona: zonaConectada, tipo});
      cogoToast.loading("Conectando con el servidor...", { position: "bottom-left" })
      //unirse a la sala con la zona actual
      socket.emit(metodos.UNIR_SALA_PENDIENTES, {zona: zonaSeleccionada, tipo});
      setZonaConectada(zonaSeleccionada);
    } else {
      return cogoToast.warn("Debes seleccionar una zona.", { position: "top-right" })
    };
  };

  const obtenerNodos = () => {
    let nuevosNodos = [];
    const index = zonas.findIndex((e) => e._id === zonaSeleccionada);
    if (index > -1) {
      nuevosNodos = zonas[index].nodos
    } else {
      nuevosNodos = [];
    };
    return nuevosNodos.length > 0 ? nuevosNodos : nodos;
  }

  return (
    <div>
      {
        zonas.length > 1 ?
        (<div style={{ marginBottom: '.5rem' }}>
          <Select 
            size="small" 
            placeholder="Seleccionar Zona"
            style={{ width: 200 }} 
            value={zonaSeleccionada}
            onChange={(e) => setZonaSeleccionada(e)}
          >
            {zonas.map((e,i) => (
              <Option key={i} value={e._id}>{e.nombre}</Option>
            ))}
          </Select>
          <Button 
            size="small" 
            style={{ marginLeft: '.5rem' }}
            icon={<SearchOutlined/>}
            onClick={conectarZona}
            type="primary"
          >
            Buscar
          </Button>
        </div>):null
      }
      <Switch 
        checkedChildren="Pendientes" 
        unCheckedChildren="Cerradas" 
        checked={tipoEstado} 
        onChange={(e) => setTipoEstado(e)} 
        style={{ marginBottom: '.5rem' }}
      />
      <TablaPendientes
        ordenes={tipoEstado ? ordenesPendientes: ordenesCerradas}
        contratas={contratas}
        gestores={gestores}
        tecnicos={tecnicos}
        tipo={tipo}
        nodos={obtenerNodos()}
      />
    </div>
  )
};

Index.propTypes = {
  contratas: PropTypes.array,
  gestores: PropTypes.array,
  tecnicos: PropTypes.array,
  zonas: PropTypes.array,
  tipo: PropTypes.string
};

export default Index;

