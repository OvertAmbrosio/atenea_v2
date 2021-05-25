import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Row, Select, Space, Statistic, Typography } from 'antd';
import {  SyncOutlined } from '@ant-design/icons';
import moment from 'moment';

import Contenedor from '../../../common/Contenedor';
import generarMetas from '../../../../libraries/generarMetas';
import { listaHoras } from './listaHoras';
import { gponAltas, hfcAltas } from '../../../../constants/valoresToa';
import ChartDualAxes from './ChartDualAxes';
//eslint-disable-next-line
import { TOrdenesToa } from '../../../../libraries/separarField';
import ExcelProduccionHora from '../../../excelExports/ExcelProduccionHora';

/**
 * @param {object} props 
 * @param {TOrdenesToa[]} props.ordenes
 * @param {boolean} props.loading
 * @param {string} props.negocio
 * @param {string} props.zona
 */
function Index({ordenes=[], tecnicos=[], loadingTecnicos, negocio, zona, cargarRutas}) {
  const [tecnicosNegocio, setTecnicosNegocio] = useState([]);
  const [tecnicosFiltrados, setTecnicosFiltrados] = useState([]);
  const [iniciadosMeta, setIniciadosMeta] = useState(0);
  const [tecnologia, setTecnologia] = useState("TODO");
  const [dataProduccion, setDataProduccion] = useState([]);
  const [metaOrdenes, setMetaOrdenes] = useState(0);
  const [listaHorasActual, setListaHorasActual] = useState([]);

  useEffect(() => {
    setMetaOrdenes(generarMetas(zona, negocio, tecnologia));
  //eslint-disable-next-line
  }, [zona, negocio, tecnologia]);

  useEffect(() => {
    if (tecnicos.length > 0 && negocio && tecnologia) {
      filtrarTecnicos(tecnicos);
    } else {
      setTecnicosNegocio([]);
      setTecnicosFiltrados([]);
      setIniciadosMeta(0);
    };
  //eslint-disable-next-line
  }, [tecnicos, ordenes, negocio, tecnologia]);

  useEffect(() => {
    if (tecnicosFiltrados.length > 0) {
      generarProduccion();
    };
  //eslint-disable-next-line
  },[tecnicosFiltrados, tecnologia])

  function filtrarTecnicos(data) {
    let tecnicosZona = data.filter((e) => e && e.empleado.zonas && 
      e.empleado.tipo_negocio.toLowerCase() === negocio.toLowerCase() &&
      e.empleado.zonas.some((z) => z.nombre === zona)
    );
    setTecnicosNegocio(tecnicosZona);
    if (tecnologia !== "TODO" && negocio === "ALTAS") {
      tecnicosZona = tecnicosZona.filter((e) => e && e.empleado && e.empleado.sub_tipo_negocio === tecnologia.toLowerCase())
    }
    const fechaMeta = moment(new Date()).set("hour", 8).set("minute",30).set('second', 59);
    const meta = tecnicosZona.filter((e) => moment(e.fecha_iniciado).isValid() && moment(e.fecha_iniciado).unix() <= fechaMeta.unix());
    setTecnicosFiltrados(tecnicosZona);
    if (isNaN(Math.round((meta.length * 100)/tecnicosZona.length))) {
      setIniciadosMeta(0);
    } else {
      setIniciadosMeta(Math.round((meta.length * 100)/tecnicosZona.length));
    };    
  };

  function generarProduccion() {
    const horaActual = moment(new Date(), "HH:mm").add(1 ,"hour").unix();
    const nuevaLista = listaHoras.filter((e) => moment(e, "HH:mm").unix() < horaActual);
    setListaHorasActual(nuevaLista);
    let completadas = ordenes;
    if (tecnologia === "GPON" && negocio === "ALTAS") {
      completadas = completadas.filter((e) => e && gponAltas.includes(e['subtipo de actividad']))
    } else if (tecnologia === "HFC" && negocio === "ALTAS") {
      completadas = completadas.filter((e) => e && hfcAltas.includes(e['subtipo de actividad']))
    } else if (tecnologia === "TODO" && negocio === "ALTAS") {
      completadas = completadas.filter((e) => e && [...hfcAltas,...gponAltas].includes(e['subtipo de actividad']))
    };
    try {
      let nuevaData = [];
      let dataPorcentaje = [];
      nuevaLista.forEach((hora, i) => {
        let horaMayor = moment(hora, "HH:mm").unix();
        let ordenesRangoHora = completadas
          .filter((e) => (moment(e.hora_de_pre_no_realizado_tecnico, "YYYY-MM-DD HH:mm").unix() <= horaMayor))
        let valorMeta = Number(((metaOrdenes * tecnicosFiltrados.length )/10) * (i+1)).toFixed(0)
        nuevaData.push(
          { hora, valor: ordenesRangoHora.length, ordenes: ordenesRangoHora, tipo:"Cantidad" },
          { hora, valor: valorMeta, tipo:"Meta" },
          { hora, valor:  tecnicosFiltrados.length * metaOrdenes , tipo:"Total" }
        )
        dataPorcentaje.push({ hora, porcentaje: tecnicosFiltrados.length * metaOrdenes });
      });
      setDataProduccion(nuevaData);
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <Contenedor>
      <Row justify="space-between" style={{ marginTop: '.5rem', marginBottom: '1rem' }}>
        <Col>
          <Typography.Title level={5}>Seguimiento de Productividad</Typography.Title>
        </Col>
        <Col>
          <Space>
            <Button
              size="small"
              type="primary"
              disabled={loadingTecnicos}
              icon={<SyncOutlined spin={loadingTecnicos}/>}
              onClick={cargarRutas}
            >
              Rutas
            </Button>
          {negocio === "ALTAS" ? 
            (<>
              Tecnología:
              <Select
                size="small"
                placeholder="Tecnología"
                style={{ width: 100 }}
                value={tecnologia}
                onChange={(e) => setTecnologia(e)}
              >
                <Select.Option key={1} value="HFC" >HFC</Select.Option>
                <Select.Option key={2} value="GPON" >GPON</Select.Option>
                <Select.Option key={3} value="TODO" >TODO</Select.Option>
              </Select>
            </>):null
          }
            <ExcelProduccionHora
              ordenes={dataProduccion.length > 0 ? dataProduccion.map((e) => e.ordenes).filter((e) => e) : dataProduccion} 
              rutas={tecnicosFiltrados}
              horas={listaHorasActual}
              meta={generarMetas(zona, negocio, tecnologia)}
              titulo={negocio.toUpperCase() === 'AVERIAS' ? 'AVERIAS' : String(negocio+tecnologia).toUpperCase()} 
            />
          </Space>
        </Col>
      </Row>
      {/* ESTADISTICAS */}
      <Row>
        <Statistic
          title="Rutas HFC"
          value={tecnicosNegocio.filter((e) => e && e.empleado.sub_tipo_negocio === "hfc").length}
          suffix={`/${tecnicosNegocio.length}`}
          style={{
            margin: '0 32px 0 0',
          }}
        />
        <Statistic
          title="Rutas GPON"
          value={tecnicosNegocio.filter((e) => e && e.empleado.sub_tipo_negocio === "gpon").length}
          suffix={`/${tecnicosNegocio.length}`}
          style={{
            margin: '0 32px',
          }}
        />
        <Statistic 
          title="Iniciado < 8:30" 
          value={iniciadosMeta} 
          suffix="%"
          style={{
            margin: '0 32px',
          }}
        />
        <Statistic 
          title="Meta Global" 
          value={tecnicosFiltrados.length * metaOrdenes} 
          style={{
            margin: '0 32px',
          }}
        />
        <Statistic 
          title="Meta Por Ruta" 
          value={metaOrdenes}
          style={{
            margin: '0 32px',
          }}
        />
      </Row>
      <Row>
        <ChartDualAxes data={[dataProduccion,[]]} total={tecnicosFiltrados.length * metaOrdenes}/>
      </Row>
    </Contenedor>
  )
};

Index.propTypes = {
  ordenes: PropTypes.array,
  tecnicos: PropTypes.array,
  loadingTecnicos: PropTypes.bool,
  negocio: PropTypes.string,
  zona: PropTypes.string,
  cargarRutas: PropTypes.func
};

export default Index;

