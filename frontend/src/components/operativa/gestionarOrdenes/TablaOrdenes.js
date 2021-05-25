import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types';
import { Button, Col, Dropdown, Row, Table } from 'antd';
import { ExportOutlined, LoadingOutlined, SettingOutlined } from '@ant-design/icons';

import { generarColumnasGestor, columnasPendientesGestor } from './columnas/columnasPendientesGestor';
// import columnasSinBandejaGestor from './columnas/columnasSinBandejaGestor';
import { obtenerFiltroFecha, obtenerFiltroId, obtenerFiltroNombre } from '../../../libraries/obtenerFiltro';
import ModalDetalleOrden from '../administrarOrdenes/ModalsTabla/ModalDetalleOrden';
import ModalColumnas from './ModalColumnas';
import { getEmpleados, patchEmpleados } from '../../../services/apiEmpleado';
import metodos from '../../../constants/metodos';
import ModalRegistro from '../administrarOrdenes/ModalsTabla/ModalRegistro';
import ModalReiterada from '../administrarOrdenes/ModalsTabla/ModalReiterada';
import ModalInfancia from '../administrarOrdenes/ModalsTabla/ModalInfancia';
import ExcelOrdenesPendientes from '../../excelExports/ExcelOrdenesPendientes';

function TablaOrdenes({nodos, tipoTabla, data, loading, ordenesSeleccionadas, setOrdenesSeleccionadas, setCantidadFiltrados }) {
  const [columnasUsuario, setColumnasUsuario] = useState([]);
  const [columnasTabla, setColumnasTabla] = useState([]);
  const [filtros, setFiltros] = useState({
    filtroBucket:[],
    filtroContrata:[],
    filtroCtr:[],
    filtroDistrito:[],
    filtroEstadoToa:[],
    filtroEstadoGestor:[],
    filtroFechaCita:[],
    filtroNodo:[],
    filtroTecnico:[],
    filtroTecnicoAsignado:[],
    filtroTimeSlot:[],
    filtroTipo:[],
    filtroTipoRequerimiento:[],
    filtroTipoTecnologia:[],
    filtroTroba:[],
  })
  const [requerimiento, setRequerimiento] = useState(null);
  const [codigoCliente, setCodigoCliente] = useState(null);
  const [infancia, setInfancia] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalRegistro, setModalRegistro] = useState(false);
  const [modalInfancia, setModalInfancia] = useState(false);
  const [modalReiterada, setModalReiterada] = useState(false);
  const [modalColumnas, setModalColumnas] = useState(false);
  const [loadingExportar, setLoadingExportar] = useState(false);
  const [tipo, setTipo] = useState(null);

  useEffect(() => {
    obtenerColumnasGestor();
  },[]);

  useEffect(() => {
    setColumnasTabla(generarColumnas());
  //eslint-disable-next-line
  },[columnasUsuario,filtros]);

  useEffect(() => {
    generarFiltros(data);
  },[data]);

  const generarFiltros = (data) => {
    if (data && data.length > 0) {
      setFiltros({
        filtroDistrito: obtenerFiltroNombre(data, 'distrito'),
        filtroBucket: obtenerFiltroNombre(data, 'bucket'),
        filtroEstadoToa: obtenerFiltroNombre(data, 'estado_toa'),
        filtroEstadoGestor: obtenerFiltroNombre(data, 'estado_gestor'),
        filtroFechaCita: obtenerFiltroFecha(data, "fecha_cita"),
        filtroTipoRequerimiento: obtenerFiltroNombre(data, 'tipo_requerimiento'),
        filtroTipoTecnologia: obtenerFiltroNombre(data, 'tipo_tecnologia'),
        filtroCtr: obtenerFiltroNombre(data, 'codigo_ctr'),
        filtroNodo: obtenerFiltroNombre(data, 'codigo_nodo'),
        filtroTroba: obtenerFiltroNombre(data, 'codigo_troba'),
        filtroTimeSlot: obtenerFiltroNombre(data, 'tipo_agenda'),
        filtroContrata: obtenerFiltroId(data, 'contrata'),
        filtroTecnico: obtenerFiltroId(data, 'tecnico', true),
        filtroTecnicoAsignado: obtenerFiltroId(data, 'tecnico_liteyca', true),
        filtroTipo: obtenerFiltroNombre(data, 'tipo'),
        filtroTipoCita: obtenerFiltroNombre(data, 'tipo_cita')
      });
    };
  };

  async function obtenerColumnasGestor() {
    return await getEmpleados(true, { metodo: metodos.EMPLEADOS_LISTAR_COLUMNAS } )
      .then(({data}) => {
        if (data && data.columnas) {
          setColumnasUsuario(data.columnas)
        }
      }).catch((err) => console.log(err))
  };

  async function guardarColumnasGestor(keys) {
    setModalColumnas(false);
    return await patchEmpleados(true, { columnas: keys, metodo: metodos.EMPLEADOS_ACTUALIZAR_COLUMNAS })
      .then(() => obtenerColumnasGestor())
  }

  const abrirModalDetalle = () => setModalDetalle(!modalDetalle);
  const abrirModalRegistro = () => setModalRegistro(!modalRegistro);
  const abrirModalReiterada = () => setModalReiterada(!modalReiterada);
  const abrirModalInfancia = () => setModalInfancia(!modalInfancia); 
  const abrirModalColumnas = () => setModalColumnas(!modalColumnas);

  const onChangeTable = (_, __, ___, dataSource) => {
    generarFiltros(dataSource.currentDataSource);
    setCantidadFiltrados(dataSource.currentDataSource.length)
  };

  const abrirDetalle = (req, tipo) => {
    setTipo(tipo);
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

  const generarColumnas = () => {
    if (tipoTabla === "pendientes") {
      return generarColumnasGestor(columnasUsuario, {
        filtros,
        abrirReiterada,
        abrirInfancia,
        abrirRegistro
      })
    } else if (tipoTabla === "cerradas") {
      return generarColumnasGestor([], {
        filtros,
        abrirReiterada,
        abrirInfancia,
        abrirRegistro
      })
    } else if (tipoTabla === "global") {
      //ordenes sin asignar
    } else {
      return []
    }
  };

  return (
    <div>
      <Table
        rowKey="codigo_requerimiento"
        onChange={onChangeTable}
        onRow={(record) => {
          return {
            onDoubleClick: () => abrirDetalle(record.codigo_requerimiento, record.tipo),
          }
        }}
        rowSelection={{
          columnWidth: 50,
          selectedRowKeys: ordenesSeleccionadas,
          onChange: (e) => setOrdenesSeleccionadas(e)
        }}
        columns={columnasTabla}
        dataSource={data}
        loading={loading}
        size="small"
        scroll={{ y: '65vh' }}
        pagination={{
          defaultPageSize: 50,
          pageSizeOptions: [50,100,200]
        }}
        footer={() => {
          if (tipoTabla === "pendientes") {
            return (
              <Row justify="space-between" align="middle">
                <Col>
                  <Dropdown
                    overlay={<ExcelOrdenesPendientes 
                      metodo={metodos.ORDENES_OBTENER_P_EXPORTAR} 
                      tipo="gestor" 
                      setLoading={setLoadingExportar} nodos={nodos} 
                      ordenes={ordenesSeleccionadas}
                      />
                    } 
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
                  <Button
                    size="small"
                    type="primary"
                    icon={<SettingOutlined/>} 
                    onClick={abrirModalColumnas}
                  >
                    Preferencias
                  </Button>
                </Col>
              </Row>
            )
          } else { return null; }
        }}
      />
      {/* MODAL DETALLE */}
      <ModalDetalleOrden visible={modalDetalle} abrir={abrirModalDetalle} requerimiento={requerimiento} tipo={tipo}/>
      {/* MODAL DEL REGISTRO */}
      <ModalRegistro visible={modalRegistro} abrir={abrirModalRegistro} requerimiento={requerimiento}/>
      {/* MODAL REITERADA */}
      <ModalReiterada visible={modalReiterada} abrir={abrirModalReiterada}  codigo_cliente={codigoCliente}/>
      {/* MODAL INFANCIA */}
      <ModalInfancia visible={modalInfancia} abrir={abrirModalInfancia} requerimiento={infancia}/>
      {/* MODAL PARA CONFIGURAR LAS COLUMNAS */}
      <ModalColumnas 
        visible={modalColumnas} 
        abrir={abrirModalColumnas} 
        columnasBase={columnasPendientesGestor(filtros)}
        columnasUsuario={columnasUsuario}
        guardar={guardarColumnasGestor}
        />
    </div>
  )
};

TablaOrdenes.propTypes = {
  tipoTabla: PropTypes.string,
  data: PropTypes.array,
  ordenesSeleccionadas: PropTypes.array,
  setOrdenesSeleccionadas: PropTypes.func,
  usuario: PropTypes.object
};

export default TablaOrdenes

