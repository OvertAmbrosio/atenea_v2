import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Select, DatePicker, Button, Table } from 'antd';
import { LoadingOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import cogoToast from 'cogo-toast';
import { useJsonToCsv } from 'react-json-csv';

import { getCargos } from '../../../../services/apiCargos';
import { getAsistencias, patchAsistencia } from '../../../../services/apiAsistencia';
import ordenarAsistencias from '../../../../libraries/ordenarAsistencias';
import { obtenerFiltroArray, obtenerFiltroId } from '../../../../libraries/obtenerFiltro';
import metodos from '../../../../constants/metodos';
import generarColumnas from './generarColumnas';
import ModalEditarAsistencia from './ModalEditarAsistencia';
import ModalRegistroAsistencia from './ModalRegistroAsistencia';
import ExcelAsistencia from '../../../excelExports/ExcelAsistencia';
import { niveles } from '../../../../constants/cargos';

const { Option } = Select;
const { RangePicker } = DatePicker;

function TablaAsistenciaCargo({gestor=false}) {
  const [totalAsisntencias, setTotalAsisntencias] = useState([]);
  const [dataAsistencias, setDataAsistencias] = useState([]);
  const [listaCargos, setListaCargos] = useState([]);
  const [loadingAsistencia, setLoadingAsistencia] = useState(false);
  const [loadingCargos, setLoadingCargos] = useState(false);
  const [loadingActualizar, setLoadingActualizar] = useState(false);
  const [cargoSeleccionado, setCargoSeleccionado] = useState(null);
  const [diaInicio, setDiaInicio] = useState(moment().startOf('week'));
  const [diaFin, setDiaFin] = useState(moment().endOf('week'));
  const [listaDias, setListaDias] = useState([]);
  const [columnas, setColumnas] = useState(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalRegistro, setModalRegistro] = useState(false);
  const [idAsistencia, setIdAsistencia] = useState(null);
  const [registro, setRegistro] = useState([]);
  const [fechaRegistro, setFechaRegistro] = useState(null);
  const [filtroGestores, setFiltroGestores] = useState([]);
  const [filtroSupervisores, setfiltroSupervisores] = useState([]);
  const [filtroContratas, setFiltroContratas] = useState([]);
  const [filtroZonas, setFiltroZonas] = useState([]);
  const { saveAsCsv } = useJsonToCsv();

  useEffect(() => {
    if (gestor) {
      listarAsistencias();
    }
    cambiarRango([moment().startOf('week'), moment().endOf('week')])
    cargarCargos();
  //eslint-disable-next-line
  },[]);

  useEffect(() => {
    if (cargoSeleccionado !== null) {
      setColumnas(generarColumnas({
        nivel: listaCargos[cargoSeleccionado].nivel, 
        dias: listaDias,
        editar: editarAsistencia,
        registro: listarRegistro,
        listar: listarAsistencias,
        filtros: { filtroGestores, filtroSupervisores, filtroContratas, filtroZonas }
      }))
    } else {
      setColumnas(generarColumnas({
        nivel: niveles.OPERATIVO, 
        dias: listaDias,
        gestor,
        editar: editarAsistencia,
        registro: listarRegistro,
        listar: listarAsistencias,
        filtros: { filtroGestores, filtroSupervisores, filtroContratas, filtroZonas }
      }));
    };
  //eslint-disable-next-line
  }, [filtroGestores, filtroContratas, filtroSupervisores, filtroZonas])

  async function cargarCargos() {
    setLoadingCargos(true);
    await getCargos(true)
      .then(({data}) => setListaCargos(data))
      .catch((err) => console.log(err))
      .finally(() => setLoadingCargos(false));
  };

  async function listarAsistencias() {
    if (cargoSeleccionado === null && !gestor) return cogoToast.warn("Debes seleccionar un cargo.", { position: "top-right" });
    if (diaInicio && diaFin && listaCargos.length > 0) {
      setLoadingAsistencia(true);
      await getAsistencias({
        metodo: metodos.ASISTENCIA_LISTAR_TODO,
        cargo: !gestor ? listaCargos[cargoSeleccionado]._id : null,
        fechaInicio: diaInicio.toDate(),
        fechaFin: diaFin.toDate()
      }).then(async({data}) => {
        setTotalAsisntencias(data);
        return ordenarAsistencias(
          !gestor ? listaCargos[cargoSeleccionado].nivel : niveles.OPERATIVO, 
          data
        )
      }).then((resultado) => {
        if (resultado && resultado.length > 0) {
          setFiltroGestores(obtenerFiltroId(resultado, 'gestor', true));
          setfiltroSupervisores(obtenerFiltroId(resultado, 'supervisor', true));
          setFiltroContratas(obtenerFiltroId(resultado, 'contrata', false));
          setFiltroZonas(obtenerFiltroArray(resultado, "zonas"));
          setDataAsistencias(resultado);
          // setRutasAverias(rutasAtivas(resultado.filter((e) => e.estado_empresa === estadoEmpleado.ACTIVO && e.tipo_negocio === 'averias' && ['hfc','gpon'].includes(e.sub_tipo_negocio))));
          // setRutasAltas(rutasAtivas(resultado.filter((e) => e.estado_empresa === estadoEmpleado.ACTIVO && e.tipo_negocio === 'altas' && ['hfc','gpon'].includes(e.sub_tipo_negocio))));
          // setRutasGpon(rutasAtivas(resultado.filter((e) => e.estado_empresa === estadoEmpleado.ACTIVO && e.sub_tipo_negocio === 'gpon' && e.tipo_negocio === 'altas')))
        } else {
          setDataAsistencias([]);
          cogoToast.warn('No se encontraron registros.', { position: 'top-right' });
        }
      }).catch((err) => console.log(err)).finally(() => setLoadingAsistencia(false));
    } else {
      cogoToast.warn('Debes seleccionar un rango de fechas primero.', { position: 'top-right' });
    }
  };
  
  async function actualizarAsistencia(estado, observacion) {
    setLoadingActualizar(true);
    return await patchAsistencia({
      metodo: metodos.ASISTENCIA_ACTUALIZAR, 
      asistencia: {
        _id: idAsistencia, 
        estado, observacion,
      }
    }).catch((err) => console.log(err))
      .finally(() => {
        setLoadingActualizar(false);
        setModalEditar(false);
        listarAsistencias();
      });
  };

  function listarRegistro(obj, dia) {
    if (obj && obj.length > 0 ) {
      setRegistro(obj);
      setFechaRegistro(dia);
      abrirModalRegistro();
    } else {
      cogoToast.warn("No se encontraron registros en la fecha seleccionada.", { position: "top-right" })
    };
  };

  const editarAsistencia = (id) => {
    setModalEditar(true)
    setIdAsistencia(id);
  };

  const abrirModalEditar = () => setModalEditar(!modalEditar);
  const abrirModalRegistro = () => setModalRegistro(!modalRegistro);

  const cambiarRango = (dias) => {
    if (dias && dias.length > 1) {
      const diff = moment(dias[1].toDate()).diff(dias[0].toDate(), 'days');
      setDiaInicio(dias[0]);
      setDiaFin(dias[1])
      let days = [];
      for (let i = 0; i <= diff; i++) {
        days.push(moment(dias[0].toDate()).add(i, 'days').format("DD-MM"));
      };
      setListaDias(days);
    } else {
      setDiaInicio(moment().startOf('week'));
      setDiaFin(moment().endOf('week'));
    }
  };

  function exportarRaw() {
    if (totalAsisntencias && totalAsisntencias.length > 0) {
      return saveAsCsv({ 
        data: totalAsisntencias.map((o) => {
          console.log(o);
          return ({
            zona: o.empleado && o.empleado.zonas && o.empleado.zonas.length > 0 ? o.empleado.zonas[0].nombre : '-',
            tecnico_carnet: o.empleado && o.empleado.nombre? o.empleado.carnet : null,
            tecnico: o.empleado && o.empleado.nombre? o.empleado.nombre+' '+o.empleado.apellidos : '-',
            gestor: o.empleado && o.empleado.gestor? o.empleado.gestor.nombre+' '+o.empleado.gestor.apellidos : '-',
            gestor_carnet: o.empleado && o.empleado.gestor? o.empleado.gestor.carnet : '-',
            contrata: o.empleado && o.empleado.contrata ? o.empleado.contrata.nombre: '-',
            supervisor: o.empleado && o.empleado.supervisor? o.empleado.supervisor.nombre+' '+o.empleado.supervisor.apellidos : '-',
            fecha: o.fecha_asistencia && moment(o.fecha_asistencia).isValid() ? moment(o.fecha_asistencia).format('DD/MM/YYYY') :'-',
            estado: o.estado,
            iniciado: o.iniciado ? "SI" : "NO",
            hora_iniciado: o.fecha_iniciado && moment(o.fecha_iniciado).isValid() ? moment(o.fecha_iniciado).format('HH:mm') : '-',
            observacion: o.historial_registro && o.historial_registro.length > 0 ? o.historial_registro[o.historial_registro.length -1].observacion: "-",
            hora_observacion: o.historial_registro && o.historial_registro.length > 0 ? moment(o.historial_registro[o.historial_registro.length -1].fecha_registro).format('DD-MM HH:mm'): "-",
          })
        }), 
        fields: {
          zona: 'Zona',
          tecnico_carnet: "Tecnico Carnet",
          tecnico: "Tecnico",
          gestor: "Gestor",
          gestor_carnet: "Gestor Carnet",
          contrata: "Contrata",
          supervisor: "Supervisor",
          fecha: "Fecha",
          estado: "Estado",
          iniciado: "Iniciado",
          hora_iniciado: "Hora iniciado",
          observacion: "Ultima Observacion",
          hora_observacion: "Fecha Observacion"
        }, 
        filename: `data_personal_${moment().format('DD_MM_YY_HH_mm')}`
      })
    } else {
      return cogoToast.warn("No hay data.", { position: "top-right" });
    }
  };

  return (
    <div>
      <Row style={{ margin: ".8rem 0" }}>
      {
        !gestor ? 
        <Col sm={12} style={{ paddingRight: "1.5rem" }}>
          <h4>Seleccionar Cargo:</h4>
          <Select
            size="small"
            placeholder="Seleccionar Cargo"
            loading={loadingCargos}
            style={{ width: "100%" }}
            value={cargoSeleccionado}
            onChange={(e) => setCargoSeleccionado(e)}
            defaultActiveFirstOption
          >
          {
            listaCargos && listaCargos.length > 0 ? 
            listaCargos.map((e,i) => (
              <Option key={i} value={i}>{e.nombre}</Option>
            )):null
          }
          </Select>
        </Col> : null
      }
        
        <Col sm={12}>
          <h4>Seleccionar rango de Fechas:</h4>
          <RangePicker
            size="small"
            style={{ marginRight: '.5rem' }}
            onChange={cambiarRango}
            value={[moment(diaInicio), moment(diaFin)]}
          />
        </Col>
      </Row>
      <Button 
        type="primary"
        size="small"
        disabled={loadingAsistencia}
        icon={loadingAsistencia ? <LoadingOutlined/> : <SearchOutlined/>}
        style={{ marginBottom: "1rem" }}
        onClick={listarAsistencias}
      >
        Buscar
      </Button>
      <Table
        rowKey="_id"
        size="small"
        loading={loadingAsistencia}
        columns={columnas}
        dataSource={dataAsistencias}
        scroll={{ y: "75vh", x: "75vw" }}
        pagination={{
          defaultPageSize: 50,
          pageSizeOptions: [50,100,200]
        }}
        footer={() => 
          <Row justify="space-between">
            <Col>
              <ExcelAsistencia 
                nivel={cargoSeleccionado && listaCargos.length > 0 ? listaCargos[cargoSeleccionado].nivel: niveles.OPERATIVO} 
                data={dataAsistencias && dataAsistencias.length > 0 ? dataAsistencias.map((e) => ({ 
                  ...e, 
                  iniciado: e[moment().format('DD-MM')] && e[moment().format('DD-MM')].iniciado ? "Si":"No" 
                })) : []} 
                dias={listaDias} 
                cargo={cargoSeleccionado && listaCargos.length > 0 ? listaCargos[cargoSeleccionado].nombre: null}
              />
            </Col>
            <Col>
              <Button 
                disabled={loadingAsistencia} 
                loading={loadingAsistencia} 
                size="small" 
                type="primary" 
                style={{ marginBottom: '.5rem' }} 
                onClick={exportarRaw} 
                icon={<SaveOutlined/>}
              >
                RAW
              </Button>
            </Col>
          </Row>
        }
      />
      {/* MODAL PARA EDITAR LA ASISTENCIA */}
      <ModalEditarAsistencia 
        visible={modalEditar} 
        abrir={abrirModalEditar} 
        loadingActualizar={loadingActualizar} 
        actualizar={actualizarAsistencia} 
      />
      {/* MODAL DEL REGISTRO DE LA ASISTENCIA */}
      <ModalRegistroAsistencia
        fecha={fechaRegistro}
        registro={registro}
        visible={modalRegistro}
        abrir={abrirModalRegistro}
      />
    </div>
  )
};

TablaAsistenciaCargo.propTypes = {
  gestor: PropTypes.bool
};

export default TablaAsistenciaCargo;

