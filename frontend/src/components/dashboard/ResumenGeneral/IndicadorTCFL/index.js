import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Col, Row, Space, Statistic, Tabs, Typography } from 'antd';
import { AlertOutlined, CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

import Contenedor from '../../../common/Contenedor'
import ChartGauge from './ChartGauge';
import ChartBarTCFL from './ChartBarTCFL';
import { gponAltas, gponAverias, hfcAltas, hfcAverias } from '../../../../constants/valoresToa';
import colores from '../../../../constants/colores';
//eslint-disable-next-line
import { TOrdenesToa } from '../../../../libraries/separarField';

const ordenesAverias = [...hfcAverias, ...gponAverias];
const ordenesAltas = [...hfcAltas, ...gponAltas];

/**
 * @param {object} props
 * @param {TOrdenesToa[]} props.ordenes
 * @param {boolean} props.loading
 * @param {string} props.negocio
 */
function Index({ordenes=[], loading, negocio}) {
  const [excluir, setExcluir] = useState(false);
  const [datosTcfl, setDatosTcfl] = useState({plazo:0, vencidas:0, hora:24})
  const [dataFiltrada, setDataFiltrada] = useState([]);
  
  useEffect(() => {
    if (ordenes.length > 0) {
      obtenerTCFL()
    }
  //eslint-disable-next-line
  },[ordenes, excluir]);

  function obtenerTCFL() {
    const ordenesAgendas = excluir ? ordenes
      .filter((e) => [...ordenesAverias, ...ordenesAltas].includes(e['subtipo de actividad']) && String(e['tipo de cita']).toLowerCase() === "telefónica")
      :
      ordenes.filter((e) => [...ordenesAverias, ...ordenesAltas].includes(e['subtipo de actividad']))
    if (negocio === 'ALTAS') {
      setDataFiltrada(ordenesAgendas.map((e) => ({...e, bucket: e['bucket inicial']})));
      setDatosTcfl(generarDatosTcfl(ordenesAgendas, 72));
    } else if (negocio === 'AVERIAS') {
      setDataFiltrada(ordenesAgendas.map((e) => ({...e, bucket: e['bucket inicial']})));
      setDatosTcfl(generarDatosTcfl(ordenesAgendas, 24));
    } else {
      setDatosTcfl({plazo: 0, vencidas: 0})
    }
  }
  /**
   * @param {TOrdenesToa[]} data 
   * @param {number} hora
   */
  function generarDatosTcfl(data, hora) {
    const plazo = data.filter((e) => moment(e.hora_de_pre_no_realizado_tecnico, 'YYYY-MM-DD HH:mm')
      .diff(moment(e['fecha de registro legados'], 'DD/MM/YY HH:mm A'), 'hour') < hora).length;
    const vencidas = data.filter((e) => moment(e.hora_de_pre_no_realizado_tecnico, 'YYYY-MM-DD HH:mm')
      .diff(moment(e['fecha de registro legados'], 'DD/MM/YY HH:mm A'), 'hour') >= hora).length;
    
    return {plazo, vencidas, hora}
  };
  
  return (
    <Contenedor>
      <Row justify="space-between" style={{ marginTop: '.5rem', marginBottom: '1rem' }}>
        <Col>
          <Typography.Title level={5}>Indicador TCFL</Typography.Title>
        </Col>
        <Col>
          <Checkbox
            checked={excluir}
            onChange={(e) => setExcluir(e.target.checked)}
          >
            Excluir Agenda
          </Checkbox>
        </Col>
      </Row>
      <Row style={{ marginBottom: '1rem' }}>
        <Col sm={8}>
          <Space size="large">
            <Statistic
              title={negocio === 'AVERIAS' ? 'Averias 24h': 'Plazo 72h'}
              value={datosTcfl.plazo}
              valueStyle={{ color: colores.success }}
              prefix={<CheckCircleOutlined />}
            />
            <Statistic
              title="Vencidas"
              value={datosTcfl.vencidas}
              valueStyle={{ color: colores.error }}
              prefix={<AlertOutlined />}
            />
          </Space>
          <ChartGauge plazo={datosTcfl.plazo} vencidas={datosTcfl.vencidas} loading={loading}/>
        </Col>
        <Col sm={16}>
          <Tabs defaultActiveKey="1" tabPosition="left" animated={true}>
            <Tabs.TabPane tab="Bucket" key="1">
              <ChartBarTCFL data={dataFiltrada} tipo="bucket" loading={loading} horas={datosTcfl.hora}/>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Contrata" key="2">
              <ChartBarTCFL data={dataFiltrada} tipo="contrata" loading={loading} horas={datosTcfl.hora}/>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Gestor" key="3">
              <ChartBarTCFL data={dataFiltrada} tipo="gestor" loading={loading} horas={datosTcfl.hora}/>
            </Tabs.TabPane>
          </Tabs>
        </Col>
      </Row>
    </Contenedor>
  )
};

Index.propTypes = {
  ordenes: PropTypes.array,
  loading: PropTypes.bool,
  negocio: PropTypes.string
};

export default Index;

