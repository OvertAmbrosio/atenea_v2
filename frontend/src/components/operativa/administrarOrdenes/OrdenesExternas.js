import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types';
import { Button, InputNumber, Table } from 'antd';
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';

import { getOrdenes } from '../../../services/apiOrden';
import metodos from '../../../constants/metodos';
import { obtenerFiltroFecha, obtenerFiltroId, obtenerFiltroNombre } from '../../../libraries/obtenerFiltro';
import ModalRegistro from './ModalsTabla/ModalRegistro';
import ColumnasOrdenes from './columnas/columnasOrdenes';
import ModalDetalleOrden from './ModalsTabla/ModalDetalleOrden';
import ModalReiterada from './ModalsTabla/ModalReiterada';
import ModalInfancia from './ModalsTabla/ModalInfancia';

function OrdenesExternas({tipo}) {
  const [bandeja, setBandeja] = useState(472);
  const [dataOrdenes, setDataOrdenes] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [requerimiento, setRequerimiento] = useState(null);
  const [codigoCliente, setCodigoCliente] = useState(null);
  const [infancia, setInfancia] = useState(null);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [listaFiltros, setListaFiltros] = useState({});
  const [ordenesSeleccionadas, setOrdenesSeleccionadas] = useState([]);
  const [modalRegistros, setModalRegistros] = useState(false);
  const [modalReiterada, setModalReiterada] = useState(false);
  const [modalInfancia, setModalInfancia] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);

  useEffect(() => {
    listarOrdenes();
  // eslint-disable-next-line
  },[]);

  useEffect(() => {
    const columnas = ColumnasOrdenes({
      tipo,
      listaFiltros,
      abrirReiterada,
      abrirInfancia,
      abrirRegistro,
    })
    columnas.splice(1, 0, {
      title: "Zona",
      dataIndex: "codigo_zonal",
      fixed: "left",
      width: 70,
      filters: listaFiltros.filtroZonas ?  listaFiltros.filtroZonas : [],
      onFilter: (v,r) => r.codigo_zonal && r.codigo_zonal.indexOf(v) === 0
    })
    setColumnas(columnas)
  //eslint-disable-next-line
  },[listaFiltros]);

  async function listarOrdenes() {
    setLoadingOrdenes(true);
    setOrdenesSeleccionadas([]);
    await getOrdenes(true, { metodo: metodos.ORDENES_OBTENER_OTRAS_BANDEJAS, tipo, bandeja: bandeja ||472 })
      .then(({data}) => {
        if (data && data.length > 0) {
          setDataOrdenes(data);
          generarFiltros(data);
        } else {
          setDataOrdenes([]);
        }
      }).catch((err) => console.log(err)).finally(() => setLoadingOrdenes(false));
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
      filtroZonas: obtenerFiltroNombre(dataSource, "codigo_zonal")
    });   
  };

  const abrirModalRegistro = () => setModalRegistros(!modalRegistros);
  const abrirModalReiterada = () => setModalReiterada(!modalReiterada);
  const abrirModalInfancia = () => setModalInfancia(!modalInfancia);
  const abrirModalDetalle = () => setModalDetalle(!modalDetalle);

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
      <div>
        <InputNumber
          size="small"
          placeholder="Bandeja"
          style={{ marginRight: '.5rem' }}
          value={bandeja}
          onChange={(e) => setBandeja(e)}
        />
        <Button 
          type="primary"
          size="small"
          disabled={loadingOrdenes}
          icon={loadingOrdenes ? <LoadingOutlined spin/>:<ReloadOutlined/>}
          style={{ marginBottom: '1rem', marginRight: '.5rem' }}
          onClick={listarOrdenes}
        >Actualizar</Button>
      </div>
      <Table
        rowKey="_id"
        rowSelection={{
          columnWidth: 50,
          selectedRowKeys: ordenesSeleccionadas,
          onChange: (e) => setOrdenesSeleccionadas(e)
        }}
        columns={columnas}
        dataSource={dataOrdenes}
        loading={loadingOrdenes}
        size="small"
        scroll={{ y: '65vh' }}
        pagination={{
          defaultPageSize: 50,
          pageSizeOptions: [50,100,200]
        }}
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

OrdenesExternas.propTypes = {
  tipo: PropTypes.string
};

export default OrdenesExternas;

