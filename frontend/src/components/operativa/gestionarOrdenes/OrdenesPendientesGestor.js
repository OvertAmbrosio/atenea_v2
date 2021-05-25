import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Row, Space, Statistic } from 'antd';
import { LoadingOutlined, FileSyncOutlined, UserSwitchOutlined, GlobalOutlined } from '@ant-design/icons';

import TablaOrdenes from './TablaOrdenes';
import AgregarObservacion from '../common/AgregarObservacion';
import ModalAsignar from '../administrarOrdenes/ModalsTabla/ModalAsignar';
import ModalEstado from '../administrarOrdenes/ModalsTabla/ModalEstado';
import ModalMapaOrdenes from '../administrarOrdenes/ModalsTabla/ModalMapaOrdenes';
import { acomodarOrdenes } from '../../../libraries/acomodarOrdenes';

function OrdenesPendientesGestor({usuario={},ordenes=[], gestores=[], tecnicos=[]}) {
  const [ordenesSeleccionadas, setOrdenesSeleccionadas] = useState([]);
  const [cantidadFiltrados, setCantidadFiltrados] = useState(0);
  const [modalMapa, setModalMapa] = useState(false);
  const [modalAsignar, setModalAsignar] = useState(false);
  const [modalEstado, setModalEstado] = useState(false);
  const [loadingObservacion, setLoadingObservacion] = useState(false);
  const [loadingAsignar, setLoadingAsignar] = useState(false);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [nuevaData, setNuevaData] = useState(false);

  useEffect(() => {
    setNuevaData(true);
    setLoadingObservacion(false);
    setLoadingAsignar(false);
    setLoadingEstados(false);
  },[ordenes]);
  
  const abrirModalMapa = () => setModalMapa(!modalMapa)
  const abrirModalAsignar = () => setModalAsignar(!modalAsignar);
  const abrirModalEstado = () => setModalEstado(!modalEstado);

  return (
    <div style={{ marginBottom: '.5rem', }}>
      <div>
        {/* BOTONES DE ACCION */}
        <Row style={{ marginBottom: '.5rem' }}>
          <Space>
            <Button
              size="small"
              type="dashed"
              disabled={ordenes.length < 1}
              icon={<GlobalOutlined/>}
              onClick={abrirModalMapa}
            >
              Mapa
            </Button>
            <Button
              size="small"
              type="primary"
              disabled={ordenesSeleccionadas.length < 1 || loadingAsignar}
              icon={loadingAsignar ? <LoadingOutlined spin/>:<UserSwitchOutlined/>}
              onClick={abrirModalAsignar}
            >
              Asignar
            </Button>
            <Button
              size="small"
              type="primary"
              disabled={ordenesSeleccionadas.length < 1 || loadingEstados}
              icon={loadingEstados ? <LoadingOutlined spin/>:<FileSyncOutlined/>}
              onClick={abrirModalEstado}
            >
              Estado
            </Button>
          </Space>
        </Row>
        {/* COMENTARIOS Y ESTADISTICA */}
        <Row style={{ marginBottom: '1rem' }}>
          <AgregarObservacion 
            usuario={usuario} 
            ordenes={ordenesSeleccionadas} 
            setOrdenes={setOrdenesSeleccionadas}
            loading={loadingObservacion}
            setLoading={setLoadingObservacion}
          />
          <Col sm={8}>
            <Row>
              <Statistic title="Total" value={ordenes.length} style={{ marginRight: '1rem'}}/>
              <Statistic title="Filtradas" value={cantidadFiltrados} style={{ marginRight: '1rem'}}/>
              <Statistic title="Seleccionados" value={ordenesSeleccionadas.length} style={{ marginRight: '1rem'}}/>
            </Row>
          </Col>
        </Row>  
      </div>
      <TablaOrdenes
        tipoTabla="pendientes"
        data={ordenes} 
        loading={ordenes.length <= 0} 
        ordenesSeleccionadas={ordenesSeleccionadas} 
        setOrdenesSeleccionadas={setOrdenesSeleccionadas}
        setCantidadFiltrados={setCantidadFiltrados}
        usuario={usuario}
      />
      {/* MODAL DEL MAPA */}
      <ModalMapaOrdenes
        gestion={true}
        abrir={abrirModalMapa}
        visible={modalMapa}
        ordenes={ordenes && ordenes.length > 0 ? acomodarOrdenes(ordenes):[]}
        nuevaData={nuevaData}
        setNuevaData={setNuevaData}
      />
      {/* MODAL PARA ASIGNAR UNA ORGEN  */}
      <ModalAsignar
        gestion={true}
        visible={modalAsignar}
        abrir={abrirModalAsignar}
        gestores={gestores}
        tecnicos={tecnicos}
        setOrdenes={setOrdenesSeleccionadas}
        ordenes={ordenesSeleccionadas}
        loading={loadingAsignar}
        setLoading={setLoadingAsignar}
      />
      {/* MODAL PARA EL ESTADO */}
      <ModalEstado
        tipo={null}
        visible={modalEstado}
        abrir={abrirModalEstado}
        ordenes={ordenesSeleccionadas}
        usuario={usuario}
        setLoading={setLoadingEstados}
      />
    </div>
  )
};

OrdenesPendientesGestor.propTypes = {
  gestores: PropTypes.array,
  tecnicos: PropTypes.array,
  loadingTecnicos: PropTypes.bool
};

export default OrdenesPendientesGestor;
