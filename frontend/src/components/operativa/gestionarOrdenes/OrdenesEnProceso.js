import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import TablaOrdenes from './TablaOrdenes';
import { Button, Col, Row, Space, Statistic } from 'antd';
import AgregarObservacion from '../common/AgregarObservacion';
import { FileSyncOutlined, LoadingOutlined } from '@ant-design/icons';
import ModalEstado from '../administrarOrdenes/ModalsTabla/ModalEstado';

function OrdenesEnProceso({usuario, ordenes=[]}) {
  const [ordenesSeleccionadas, setOrdenesSeleccionadas] = useState([]);
  const [cantidadFiltrados, setCantidadFiltrados] = useState([]);
  const [modalEstado, setModalEstado] = useState(false);
  const [loadingObservacion, setLoadingObservacion] = useState(false);
  const [loadingEstados, setLoadingEstados] = useState(false);

  useEffect(() => {
    setLoadingObservacion(false);
    setLoadingEstados(false);
  },[ordenes]);

  const abrirModalEstado = () => setModalEstado(!modalEstado);

  return (
    <div>
      <div>
        {/* BOTONES DE ACCION */}
        <Row style={{ marginBottom: '.5rem' }}>
          <Space>
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
        tipoTabla="cerradas"
        data={ordenes} 
        loading={ordenes.length <= 0} 
        ordenesSeleccionadas={ordenesSeleccionadas} 
        setOrdenesSeleccionadas={setOrdenesSeleccionadas}
        setCantidadFiltrados={setCantidadFiltrados}
        usuario={usuario}
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

OrdenesEnProceso.propTypes = {
  ordenes: PropTypes.array
};

export default OrdenesEnProceso;

