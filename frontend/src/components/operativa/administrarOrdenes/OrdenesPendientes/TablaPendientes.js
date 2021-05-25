import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Dropdown, Popconfirm, Row, Space, Statistic, Table } from 'antd';
import { ExportOutlined, FileSyncOutlined, GlobalOutlined, LoadingOutlined, SyncOutlined, UserSwitchOutlined } from '@ant-design/icons';
import cogoToast from 'cogo-toast';
import Cookies from "js-cookie";

import ModalRegistro from '../ModalsTabla/ModalRegistro';
import ColumnasOrdenes from '../columnas/columnasOrdenes'
import { obtenerFiltroFecha, obtenerFiltroId, obtenerFiltroNombre } from '../../../../libraries/obtenerFiltro';
import ExcelOrdenesPendientes from '../../../excelExports/ExcelOrdenesPendientes';
import ModalReiterada from '../ModalsTabla/ModalReiterada';
import ModalInfancia from '../ModalsTabla/ModalInfancia';
import metodos from '../../../../constants/metodos';
import { AuthToken } from '../../../../services/authToken';
import variables from '../../../../constants/config';
// import ModalAgendar from '../ModalsTabla/ModalAgendar';
import ModalAsignar from '../ModalsTabla/ModalAsignar';
import ModalEstado from '../ModalsTabla/ModalEstado';
import { tipoOrdenes } from '../../../../constants/tipoOrden';
import { postOrdenes } from '../../../../services/apiOrden';
import ModalDetalleOrden from '../ModalsTabla/ModalDetalleOrden';
import AgregarObservacion from '../../common/AgregarObservacion';
import { estadosToa } from '../../../../constants/valoresToa';
import ModalMapaOrdenes from '../ModalsTabla/ModalMapaOrdenes';
import { acomodarOrdenes } from '../../../../libraries/acomodarOrdenes';

function TablaPendientes({ordenes=[], contratas=[], gestores=[], tecnicos=[], tipo, nodos=[]}) {
  const [usuario] = useState(new AuthToken(Cookies.get(variables.TOKEN_STORAGE_KEY)).decodedToken);
  const [ordenesSeleccionadas, setOrdenesSeleccionadas] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [requerimiento, setRequerimiento] = useState(null);
  const [codigoCliente, setCodigoCliente] = useState(null);
  const [infancia, setInfancia] = useState(null);
  const [listaFiltros, setListaFiltros] = useState([]);
  const [cantidadFiltrados, setCantidadFiltrados] = useState(0);
  // const [modalAgendar, setModalAgendar] = useState(false);
  const [modalMapa, setModalMapa] = useState(false);
  const [modalAsignar, setModalAsignar] = useState(false);
  const [modalEstado, setModalEstado] = useState(false);
  const [modalRegistros, setModalRegistros] = useState(false);
  const [modalReiterada, setModalReiterada] = useState(false);
  const [modalInfancia, setModalInfancia] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [loadingExportar, setLoadingExportar] = useState(false);
  const [loadingCruzarInfancias, setLoadingCruzarInfancias] = useState(false);
  // const [loadingAgendar, setLoadingAgendar] = useState(false);
  const [loadingAsignar, setLoadingAsignar] = useState(false);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingObservacion, setLoadingObservacion] = useState(false);
  const [nuevaData, setNuevaData] = useState(false);

  useEffect(() => {
    setCodigoCliente(null);
    setRequerimiento(null);
  },[]);

  useEffect(() => {
    if (ordenes && ordenes.length > 0) {
      setNuevaData(false);
      generarFiltros(ordenes);
    }
    setColumnas(ColumnasOrdenes({
      tipo,
      listaFiltros,
      abrirReiterada,
      abrirInfancia,
      abrirRegistro
    }));
    // setRequerimiento(null);
    setCodigoCliente(null);
    setInfancia(null);
    // setLoadingAgendar(false);
    setLoadingEstados(false);
    setLoadingObservacion(false);
  //eslint-disable-next-line
  },[ordenes]);

  useEffect(() => {
    setColumnas(ColumnasOrdenes({
      tipo,
      listaFiltros,
      abrirReiterada,
      abrirInfancia,
      abrirRegistro
    }))
  //eslint-disable-next-line
  },[listaFiltros]);

  async function cruzarInfancias() {
    if (tipo === tipoOrdenes.AVERIAS) {
      let ordenesCerradas = [
        estadosToa.CANCELADO, 
        estadosToa.COMPLETADO, 
        estadosToa.NO_REALIZADA
      ].map((e) => String(e).toLowerCase());

      const data = ordenes.filter((e) => !e.infancia && !ordenesCerradas.includes(String(e.estado_toa).toLowerCase())).map((e) => ({
        codigo_requerimiento: e.codigo_requerimiento,
        cliente: e.codigo_cliente,
        fecha: e.fecha_registro
      }));

      setLoadingCruzarInfancias(true);
      return await postOrdenes({ metodo: metodos.ORDENES_COMPROBAR_INFANCIAS, ordenes: data})
        .catch((e) => console.log(e))
        .finally(() => setLoadingCruzarInfancias(false));
    } else {
      cogoToast.warn('Esta funcion es solo para las ordenes de averias.', { position: 'top-right' });
    };    
  };

  const generarFiltros = (dataSource) => {
    setListaFiltros({
      filtroDistrito: obtenerFiltroNombre(dataSource, 'distrito'),
      filtroBucket: obtenerFiltroNombre(dataSource, 'bucket'),
      filtroEstadoToa: obtenerFiltroNombre(dataSource, 'estado_toa'),
      filtroEstadoGestor: obtenerFiltroNombre(dataSource, 'estado_gestor'),
      filtroTipoReq: obtenerFiltroNombre(dataSource, 'tipo_requerimiento'),
      filtroTecnologia: obtenerFiltroNombre(dataSource, 'tipo_tecnologia'),
      filtroNodo: obtenerFiltroNombre(dataSource, 'codigo_nodo'),
      filtroTroba: obtenerFiltroNombre(dataSource, 'codigo_troba'),
      filtroPai: obtenerFiltroNombre(dataSource, 'indicador_pai'),
      filtroObservacion: obtenerFiltroNombre(dataSource, 'observacion_gestor'),
      filtroTimeSlot: obtenerFiltroNombre(dataSource, 'tipo_agenda'),
      filtroFechaCita: obtenerFiltroFecha(dataSource, 'fecha_cita'),
      filtroContrata: obtenerFiltroId(dataSource, 'contrata'),
      filtroGestorAsignado: obtenerFiltroId(dataSource, 'gestor', true),
      filtroTecnicoToa: obtenerFiltroId(dataSource, 'tecnico', true),
      filtroTecnicoLiteyca: obtenerFiltroId(dataSource, 'tecnico_liteyca', true)
    });   
  };

  const onChangeTable = (_, __, ___, dataSource) => {
    setOrdenesSeleccionadas([]);
    generarFiltros(dataSource.currentDataSource);
    setCantidadFiltrados(dataSource.currentDataSource.length)
  };
  
  // const abrirModalAgendar = () => setModalAgendar(!modalAgendar);
  const abrirModalMapa = () => setModalMapa(!modalMapa);
  const abrirModalAsignar = () => setModalAsignar(!modalAsignar);
  const abrirModalEstado = () => setModalEstado(!modalEstado);
  const abrirModalRegistro = () => setModalRegistros(!modalRegistros);
  const abrirModalReiterada = () => setModalReiterada(!modalReiterada);
  const abrirModalInfancia = () => setModalInfancia(!modalInfancia);
  const abrirModalDetalle = () => setModalDetalle(!modalDetalle);
 
  const abrirDetalle = (req) => {
    abrirModalDetalle();
    setRequerimiento(req);
  };

  const abrirReiterada = (c) => {
    setCodigoCliente(c);
    abrirModalReiterada();
  };

  const abrirInfancia = async (req) => {
    abrirModalInfancia();
    setInfancia(req)
  };

  const abrirRegistro = (req) => {
    abrirModalRegistro();
    setRequerimiento(req);
  };

  return (
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
          {/* <Button
            size="small"
            type="primary"
            disabled={true}
            // disabled={ordenesSeleccionadas.length < 1 || loadingAgendar}
            icon={loadingAgendar ? <LoadingOutlined spin/>:<ScheduleOutlined />}
            onClick={abrirModalAgendar}
          >
            Agendar
          </Button> */}
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
        <Table
          rowKey="codigo_requerimiento"
          size="small"
          onChange={onChangeTable}
          onRow={(record) => {
            return {
              onDoubleClick: () => abrirDetalle(record.codigo_requerimiento),
            }
          }}
          rowSelection={{
            columnWidth: 50,
            selectedRowKeys: ordenesSeleccionadas,
            onChange: (e) => setOrdenesSeleccionadas(e)
          }}
          columns={columnas}
          dataSource={ordenes}
          loading={loadingAsignar || ordenes.length === 0}
          pagination={{
            defaultPageSize:50,
            pageSizeOptions: [50,100,200],
          }}
          scroll={{ y: modalMapa ? '0vh' : "70vh" }}
          footer={() => (
            <Row justify="space-between" align="middle">
              <Col>
                <Dropdown
                  overlay={<ExcelOrdenesPendientes metodo={metodos.ORDENES_OBTENER_P_EXPORTAR} tipo={tipo} setLoading={setLoadingExportar} nodos={nodos} ordenes={ordenesSeleccionadas}/>} 
                  placement="bottomLeft" 
                  trigger={['click']}
                  arrow
                >
                  <Button
                    size="small"
                    type="primary"
                    icon={loadingExportar ? <LoadingOutlined spin/>:<ExportOutlined/>}
                    style={{ marginBottom: '1rem', marginRight: '.5rem' }}
                  >
                    Exportar
                  </Button>
                </Dropdown>
              </Col>
              <Col>
                <Popconfirm 
                  placement="topLeft" 
                  title="Esta acción tomara mucho tiempo..." 
                  onConfirm={cruzarInfancias} 
                  okText="Si" 
                  cancelText="No"
                >
                  <Button
                    size="small"
                    disabled={loadingCruzarInfancias || ordenes.length === 0}
                    icon={loadingCruzarInfancias ? <LoadingOutlined spin/>:<SyncOutlined />}
                  >
                    Cruzar Infancias
                  </Button>
                </Popconfirm>
              </Col>
            </Row>
          )}
        />
      <ModalMapaOrdenes
        abrir={abrirModalMapa}
        visible={modalMapa}
        ordenes={ordenes && ordenes.length > 0 ? acomodarOrdenes(ordenes):[]}
        nuevaData={nuevaData}
        setNuevaData={setNuevaData}
      />
      {/* MODAL PARA AGENDAR ORDEN EN FECHA
      <ModalAgendar 
        visible={modalAgendar} 
        abrir={abrirModalAgendar} 
        gestores={gestores} 
        setLoading={setLoadingAgendar}
        ordenes={ordenesSeleccionadas}
        setOrdenes={setOrdenesSeleccionadas}
        usuario={usuario}
        tipo={tipo}
      /> */}
      {/* MODAL PARA ASIGNAR UNA ORGEN  */}
      <ModalAsignar
        visible={modalAsignar}
        abrir={abrirModalAsignar}
        contratas={contratas}
        gestores={gestores}
        tecnicos={tecnicos}
        ordenes={ordenesSeleccionadas}
        setOrdenes={setOrdenesSeleccionadas}
        loading={loadingAsignar}
        setLoading={setLoadingAsignar}
      />
      {/* MODAL PARA EL ESTADO */}
      <ModalEstado
        tipo={tipo}
        visible={modalEstado}
        abrir={abrirModalEstado}
        ordenes={ordenesSeleccionadas}
        usuario={usuario}
        setLoading={setLoadingEstados}
      />
      {/* MODAL DETALLE */}
      <ModalDetalleOrden visible={modalDetalle} abrir={abrirModalDetalle} requerimiento={requerimiento}/>
      {/* MODAL DEL REGISTRO */}
      <ModalRegistro visible={modalRegistros} abrir={abrirModalRegistro} requerimiento={requerimiento}/>
      {/* MODAL REITERADA */}
      <ModalReiterada visible={modalReiterada} abrir={abrirModalReiterada}  codigo_cliente={codigoCliente}/>
      {/* MODAL INFANCIA */}
      <ModalInfancia visible={modalInfancia} abrir={abrirModalInfancia} requerimiento={infancia}/>
    </div>
  )
};

TablaPendientes.propTypes = {
  ordenes: PropTypes.array,
  gestores: PropTypes.array,
  tipo: PropTypes.string
};

export default TablaPendientes;

