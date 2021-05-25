import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Select, Space, Statistic, Typography } from 'antd';
import { AlertOutlined, CheckCircleOutlined, FieldTimeOutlined, GlobalOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { grey } from '@ant-design/colors';

import Contenedor from '../../../common/Contenedor';
import colores from '../../../../constants/colores';
import { bajas, estadosToa, gponAltas, gponAverias, gponRutinas, hfcAltas, hfcAverias, hfcRutinas } from '../../../../constants/valoresToa';
//eslint-disable-next-line
import { TOrdenesToa, separarBucket, separarContrata, separarGestor, separarSupervisor } from '../../../../libraries/separarField';
import ChartEstadoGeneral from './ChartEstadoGeneral';

const tipoHFC = [...hfcAltas, ...hfcAverias, ...hfcRutinas];
const tipoGPON = [...gponAltas, ...gponAverias, ...gponRutinas];

const actividadAltas = [...hfcAltas, ...gponAltas];
const actividadRutinas = [...hfcRutinas, ...gponRutinas];
const actividadBajas = bajas

/**
 * @param {Object} props
 * @param {TOrdenesToa[]} props.ordenes 
 * @param {boolean} props.loading
 * @param {string} props.negocio 
 */
function Index({ordenes, loading, negocio}) {
  const [dataOrdenes, setDataOrdenes] = useState([]);
  const [tipo, setTipo] = useState('bucket');
  const [tecnologia, setTecnologia] = useState(1);
  const [subActividad, setSubActividad] = useState(4);
  const [tecDisabled, setTecDisabled] = useState(false);

  useEffect(() => {
    if (ordenes.length > 0) {
      ordenarData();
    }
  //eslint-disable-next-line
  }, [ordenes, tipo, tecnologia, subActividad]);

  useEffect(() => {
    if (subActividad === 3 && negocio === 'ALTAS') {
      setTecDisabled(true);
      setTecnologia(3);
    } else {
      setTecDisabled(false);
    };
  }, [subActividad, negocio])

  function ordenarData() {
    if (negocio === 'ALTAS') {
      setDataOrdenes(aplicarFiltro(filtrarTecnologia(filtrarSubActividad(ordenes))))
    } else {
      setDataOrdenes(aplicarFiltro(filtrarTecnologia(ordenes)))
    };
  };

  /**
   * @param {TOrdenesToa[]} data 
   */
  const aplicarFiltro = (data) => {
    switch (tipo) {
      case 'bucket': return separarBucket(data).ordenes;
      case 'contrata': return separarContrata(data).ordenes;
      case 'gestor': return separarGestor(data).ordenes;
      case 'supervisor': return separarSupervisor(data).ordenes;
      default: return [];
    };
  };

  const filtrarTecnologia = (data) => {
    switch (tecnologia) {
      case 1: return data.filter((e) => tipoHFC.includes(e['subtipo de actividad']));
      case 2: return data.filter((e) => tipoGPON.includes(e['subtipo de actividad']));
      case 3: return data;
      default: return [];
    };
  };

  const filtrarSubActividad = (data) => {
    switch (subActividad) {
      case 1: return data.filter((e) => actividadAltas.includes(e['subtipo de actividad']));
      case 2: return data.filter((e) => actividadRutinas.includes(e['subtipo de actividad']))
      case 3: return data.filter((e) => actividadBajas.includes(e['subtipo de actividad']))
      case 4: return data;
      default: return [];
    };
  };

  const contarEstados = (data=[], estado) => {
    if (data.length > 0) {
      let contador = 0;
      if (!estado) {
        data.forEach((e) => contador = contador + e.ordenes);
      } else {
        data.filter((e) => e.estado === estado).forEach((e) => contador = contador + e.ordenes);
      };
      return contador;
    } else {
      return 0
    }
  };

  const generarColores = ({estado}) => {
    switch (estado) {
      case estadosToa.PENDIENTE: return colores.Pendiente;
      case estadosToa.INICIADO: return colores.Iniciado;
      case estadosToa.COMPLETADO: return colores.Completado;
      case estadosToa.SUSPENDIDO: return colores.Suspendido;
      case estadosToa.NO_REALIZADA: return colores.NoRealizada;
      case estadosToa.CANCELADO: return colores.Cancelado;
      default: return grey.primary
    }
  };

  return (
    <Contenedor>
      <Row justify="space-between" align="middle">
        <Col>
          <Typography.Title level={5} style={{ marginTop: '.5rem', marginBottom: '1rem' }}>Estado General</Typography.Title>
        </Col>
        <Col>
          <Space>
            Filtro:
            <Select
              size="small"
              placeholder="Tipo"
              style={{ width: 110 }}
              value={tipo}
              onChange={(e) => setTipo(e)}
            >
              <Select.Option key={1} value="bucket">Bucket</Select.Option>
              <Select.Option key={2} value="contrata">Contrata</Select.Option>
              <Select.Option key={3} value="gestor">Gestor</Select.Option>
              <Select.Option key={4} value="supervisor">Supervisor</Select.Option>
            </Select>
            Tecnología:
            <Select
              size="small"
              placeholder="Tecnología"
              style={{ width: 100 }}
              disabled={tecDisabled}
              value={tecnologia}
              onChange={(e) => setTecnologia(e)}
            >
              <Select.Option key={1} value={1} >HFC</Select.Option>
              <Select.Option key={2} value={2} >GPON</Select.Option>
              <Select.Option key={3} value={3} >TODO</Select.Option>
            </Select>
          {negocio === "ALTAS" ? 
            (<>
              Sub Actividad:
              <Select
                size="small"
                placeholder="Actividad"
                style={{ width: 100 }}
                value={subActividad}
                onChange={(e) => setSubActividad(e)}
              >
                <Select.Option key={1} value={1} >ALTAS</Select.Option>
                <Select.Option key={2} value={2} >RUTINAS</Select.Option>
                <Select.Option key={3} value={3} >BAJAS</Select.Option>
                <Select.Option key={4} value={4} >TODO</Select.Option>
              </Select>
            </>):null
          }
          </Space>
        </Col>
      </Row>
      <Row style={{ marginBottom: '1rem' }}>
        <Space size="large">
          <Statistic
            title="Pendientes"
            value={contarEstados(dataOrdenes, estadosToa.PENDIENTE)}
            valueStyle={{ color: colores.warning }}
            prefix={<AlertOutlined />}
          />
          <Statistic
            title="Iniciadas"
            value={contarEstados(dataOrdenes, estadosToa.INICIADO)}
            valueStyle={{ color: colores.Iniciado }}
            prefix={<FieldTimeOutlined />}
          />
          <Statistic
            title="Canceladas"
            value={contarEstados(dataOrdenes, estadosToa.CANCELADO)}
            valueStyle={{ color: colores.Cancelado }}
            prefix={<CloseCircleOutlined />}
          />
          <Statistic
            title="Completados"
            value={contarEstados(dataOrdenes, estadosToa.COMPLETADO)}
            valueStyle={{ color: colores.Completado }}
            prefix={<CheckCircleOutlined />}
          />
            <Statistic
            title="Total"
            value={contarEstados(dataOrdenes, false)}
            prefix={<GlobalOutlined />}
          />
        </Space>
      </Row>
      <ChartEstadoGeneral
        loading={loading}
        data={dataOrdenes}
        tipo={tipo}
        generarColores={generarColores}
      />
    </Contenedor>
  )
};

Index.propTypes = {
  ordenes: PropTypes.array,
  loading: PropTypes.bool,
  negocio: PropTypes.string
};

export default Index;

