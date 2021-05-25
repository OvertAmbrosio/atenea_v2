import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types';
import { Button, Dropdown, Table, DatePicker } from 'antd';
import { ExportOutlined, LoadingOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import cogoToast from 'cogo-toast';

import { getOrdenes } from '../../../services/apiOrden';
import metodos from '../../../constants/metodos';
import columnasOrdenesLiquidadas from './columnas/columnasLiquidadas';
import { obtenerFiltroId, obtenerFiltroNombre } from '../../../libraries/obtenerFiltro';
import ModalRegistro from './ModalsTabla/ModalRegistro';
import ExcelOrdenesLiquidadas from '../../excelExports/ExcelOrdenesLiquidadas';
import columnasLiquidadasGestor from '../gestionarOrdenes/columnas/columnasLiquidadasGestor';

const { RangePicker } = DatePicker;

function OrdenesLiquidadas({tipo, gestor}) {
  const [dataOrdenes, setDataOrdenes] = useState([]);
  const [ordenesSeleccionadas, setOrdenesSeleccionadas] = useState([]);
  const [requerimiento, setRequerimiento] = useState(null);
  const [loadingActualizar, setLoadingActualizar] = useState(false)
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [loadingBuscar, setLoadingBuscar] = useState(false)
  const [loadingExportar, setLoadingExportar] = useState(false);
  const [modalRegistros, setModalRegistros] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [listaFiltros, setListaFiltros] = useState({
    filtroTecnologia: [],
    filtroCtr: [],
    filtroTipoReq: [],
    filtroNodo: [],
    filtroDistrito: [],
    filtroEstadoToa: [],
    filtroEstadoGestor: [],
  });

  useEffect(() => {
    listarOrdenes();
  // eslint-disable-next-line
  },[]);

  async function listarOrdenes() {
    setLoadingOrdenes(true);
    setLoadingActualizar(true);
    setOrdenesSeleccionadas([]);
    await getOrdenes(true, { metodo: metodos.ORDENES_OBTENER_LIQUIDADAS, tipo, fechaInicio: null, fechaFin: null })
      .then(({data}) => {
        if (data && data.length > 0) {
          generarFiltros(data);
        } else { limpiarEstados() }
      }).catch((err) => console.log(err)).finally(() => {setLoadingOrdenes(false); setLoadingActualizar(false)});
  };

  async function buscarOrdenes() {
    if (fechaInicio && fechaFin) {
      setLoadingOrdenes(true);
      setLoadingBuscar(true);
      setOrdenesSeleccionadas([]);
      await getOrdenes(true, { metodo: metodos.ORDENES_OBTENER_LIQUIDADAS, tipo, fechaInicio, fechaFin })
        .then(({data}) => {
          if (data && data.length > 0) {
            generarFiltros(data)
          } else { limpiarEstados() }
        }).catch((err) => console.log(err)).finally(() => {setLoadingOrdenes(false); setLoadingBuscar(false)});
    } else {
      cogoToast.warn('Debes seleccionar un rango de fechas.', { position: 'top-right' });
    };
  };

  const abrirModalRegistro = () => setModalRegistros(!modalRegistros);

  const abrirRegistro = (req) => {
    abrirModalRegistro();
    setRequerimiento(req);
  };

  const seleccionarFechas = (e) => {
    if (e) {
      setFechaInicio(e[0].format('YYYY/MM/DD'));
      setFechaFin(e[1].format('YYYY/MM/DD'));
    } else {
      setFechaInicio(null);
      setFechaFin(null);
    };
  };

  const limpiarEstados = () => {
    setDataOrdenes([]);
  };

  const generarFiltros = (data) => {
    setDataOrdenes(data);
    setListaFiltros({
      filtroDistrito: obtenerFiltroNombre(data, 'distrito'),
      filtroEstadoToa: obtenerFiltroNombre(data, 'estado_toa'),
      filtroEstadoGestor: obtenerFiltroNombre(data, 'estado_gestor'),
      filtroTecnologia: obtenerFiltroNombre(data, 'tipo_tecnologia'),
      filtroNodo: obtenerFiltroNombre(data, 'codigo_nodo'),
      filtroCtr: obtenerFiltroNombre(data, 'codigo_ctr'),
      filtroTimeSlot: obtenerFiltroNombre(data, 'tipo_agenda'),
      filtroContrata: obtenerFiltroId(data, 'contrata'),
      filtroGestor: obtenerFiltroId(data, 'gestor', true),
      filtroTecnico: obtenerFiltroId(data, 'tecnico_liquidado'),
    })
  };

  const generarColumnas = () => {
    if (gestor) {
      return columnasLiquidadasGestor(
        listaFiltros,
        abrirRegistro)
    } else {
      return columnasOrdenesLiquidadas(
        tipo,
        listaFiltros,
        abrirRegistro)
    };
  };

  return (
    <div>
      <div>
        <Button
          type="primary"
          size="small"
          icon={loadingActualizar ? <LoadingOutlined spin/>:<ReloadOutlined/>}
          disabled={loadingActualizar}
          style={{ marginBottom: '1rem', marginRight: '.5rem' }}
          onClick={listarOrdenes}
        >Actualizar</Button>
        <Dropdown
          overlay={
            <ExcelOrdenesLiquidadas 
              tipo={gestor ? 'gestor' : tipo} 
              setLoading={setLoadingExportar}
              ordenes={dataOrdenes}
              ordenesSeleccionadas={ordenesSeleccionadas} 
            />
          } 
          placement="bottomLeft" 
          trigger={['click']}
          arrow
        >
          <Button
            size="small"
            icon={loadingExportar ? <LoadingOutlined spin/>:<ExportOutlined/>}
            style={{ marginBottom: '1rem', marginRight: '.5rem' }}
            disabled={loadingExportar}
          >
            Exportar
          </Button>
        </Dropdown>
        <RangePicker size="small" onChange={seleccionarFechas} style={{ marginBottom: '1rem', marginRight: '.5rem' }} />
        <Button
          size="small"
          type="primary"
          icon={loadingBuscar ? <LoadingOutlined spin/>:<SearchOutlined/>}
          disabled={loadingBuscar}
          onClick={buscarOrdenes}
        >
          Buscar
        </Button>
      </div>
      <Table
        rowKey="_id"
        rowSelection={{
          columnWidth: 40,
          selectedRowKeys: ordenesSeleccionadas,
          onChange: (e) => setOrdenesSeleccionadas(e)
        }}
        columns={generarColumnas()}
        dataSource={dataOrdenes}
        loading={loadingOrdenes}
        size="small"
        scroll={{ y: '65vh' }}
        pagination={{
          defaultPageSize: 50,
          pageSizeOptions: [50,100,200]
        }}
      />
      {/* MODAL DEL REGISTRO */}
      <ModalRegistro visible={modalRegistros} abrir={abrirModalRegistro} requerimiento={requerimiento}/>
    </div>
  )
};

OrdenesLiquidadas.propTypes = {
  tipo: PropTypes.string,
  gestor: PropTypes.bool
};

export default OrdenesLiquidadas;

