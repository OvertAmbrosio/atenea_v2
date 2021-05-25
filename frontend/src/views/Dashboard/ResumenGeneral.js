import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Select, Space, Button } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import cogoToast from 'cogo-toast';

import EstadoGeneral from '../../components/dashboard/ResumenGeneral/EstadoGeneral';
import IndicadorProductividad from '../../components/dashboard/ResumenGeneral/IndicadorProductividad';
import IndicadorTCFL from '../../components/dashboard/ResumenGeneral/IndicadorTCFL';
import IndicadorLiquidación from '../../components/dashboard/ResumenGeneral/IndicadorLiquidación';
import { getZonas } from '../../services/apiZonas';
import { getOrdenesIndicadores } from '../../services/apiOrden';
import { getAsistencias } from '../../services/apiAsistencia';
import metodos from '../../constants/metodos';
import { estadosToa } from '../../constants/valoresToa';

const { Option } = Select;

export default function ResumenGeneral() {
  const [listaOrdenes, setListaOrdenes] = useState([]);
  const [ordenesTecnico, setOrdenesTecnico] = useState([]);
  const [listaZonas, setListaZonas] = useState([]);
  const [loadingZonas, setLoadingZonas] = useState(false);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);
  const [negocioSeleccionado, setNegocioSeleccionado] = useState("AVERIAS");
  const [intervaloSeleccionado, setIntervaloSeleccionado] = useState(1);
  const [listaTecnicos, setListaTecnicos] = useState([]);
  const [loadingAsistencia, setLoadingAsistencia] = useState(false);  

  useEffect(() => {
    cargarZonas();
    cargarAsistencias();
  },[]);

  useEffect(() => {
    if (listaZonas.length > 0) {
      setZonaSeleccionada(listaZonas[0].nombre);
    };
  //eslint-disable-next-line
  }, [listaZonas])

  useEffect(() => {
    if (zonaSeleccionada) {
      actualizarData(zonaSeleccionada)
    };
  //eslint-disable-next-line
  }, [zonaSeleccionada, negocioSeleccionado]);

  useEffect(() => {
    cruzarTecnicosOrdenes();
  //eslint-disable-next-line
  },[listaTecnicos, listaOrdenes]);

  async function cargarZonas() {
    setLoadingZonas(true);
    return await getZonas(false)
      .then(({data}) => setListaZonas(data))
      .catch((err) => console.log(err))
      .finally(() => setLoadingZonas(false));
  };

  async function cargarAsistencias() {
    setLoadingAsistencia(true);
    return await getAsistencias({toast: false, metodo: metodos.ASISTENCIA_LISTAR_EFECTIVAS })
      .then(({data}) => setListaTecnicos(data))
      .catch((err) => console.log(err))
      .finally(() => setLoadingAsistencia(false));
  };

  async function actualizarData(zonaNombre=false) {
    if (!zonaSeleccionada || !negocioSeleccionado) {
      return cogoToast.warn("Debes seleccionar la zona y negocio.", { position: "top-right" })
    } else {
      setLoadingOrdenes(true);
      return await getOrdenesIndicadores(true, {
        metodo: metodos.ORDENES_INDICADORES, 
        negocio: negocioSeleccionado,
        zona: zonaNombre ? zonaNombre : zonaSeleccionada
      }).then(({data}) => {
        if (data && data.length > 0) {
          const filtro = data.filter((e) => e && String(e["bucket inicial"]).substring(String(e["bucket inicial"]).length-4) !== 'PEXT')
          setListaOrdenes(filtro);
        } else {
          setListaOrdenes([]);
        };
      }).catch((err) => console.log(err))
        .finally(() => setLoadingOrdenes(false));
    };
  };

  function cruzarTecnicosOrdenes() {
    if (listaTecnicos.length > 0 && listaOrdenes.length > 0) {
      const empleados = listaTecnicos.map((e) => e.empleado);
      try {
        setOrdenesTecnico(listaOrdenes.map((orden) => {
          const tecnico = String(orden.tecnico);
          if (["LY","LX"].includes(tecnico.substr(0,2))) {
            const index = empleados.findIndex((e) => e.carnet === tecnico.substr(0,6))
            return ({
              ...orden,
              tecnico: index > -1 ? empleados[index] : orden.tecnico,
              contrata: index > -1 ? empleados[index].contrata : null,
              gestor: index > -1 ? empleados[index].gestor : null,
              supervisor: index > -1 ? empleados[index].supervisor : null
            })
          } else { return(orden) }
        }))
      } catch (error) {
        console.log(error);
      };
    } else {
      setOrdenesTecnico(listaOrdenes)
    }
  };

  return (
    <div>
      <Row align="middle" justify="space-between" style={{ padding: '.5rem 0', margin: '0 1.5rem 1rem' }}>
        <Col>
          <Typography.Title level={4} style={{ margin: 0 }}>Resumen General</Typography.Title>
        </Col>
        <Col>
          <Space>
            Zona:
            <Select 
              size="small" 
              placeholder="Zona" 
              style={{ width: 120 }} 
              loading={loadingZonas}
              value={zonaSeleccionada}
              onChange={(e) => setZonaSeleccionada(e)}
            >
            {listaZonas && listaZonas.length > 0 ?
              listaZonas.map((e,i) => (
                <Option value={e.nombre} key={i}>{e.nombre}</Option>
              )):null                
            }
            </Select>
            Negocio:
            <Select 
              size="small" 
              placeholder="Negocio" 
              style={{ width: 100 }}
              value={negocioSeleccionado}
              onChange={(e) => setNegocioSeleccionado(e)}
            >
              <Option key={1} value="AVERIAS">AVERIAS</Option>
              <Option key={2} value="ALTAS">ALTAS</Option>
              <Option key={3} value="TODO">TODO</Option>
            </Select>
            Intervalo:
            <Select 
              size="small" 
              placeholder="Fecha" 
              disabled
              style={{ width: 100 }} 
              value={intervaloSeleccionado}
              onChange={(e) => setIntervaloSeleccionado(e)}
            >
              <Option key={1} value={1}>HOY</Option>
              <Option key={2} value={2}>AYER</Option>
            </Select>
            <Button 
              size="small" 
              type="primary"
              shape="circle"
              disabled={loadingOrdenes}
              icon={<SyncOutlined spin={loadingOrdenes} />}
              onClick={() => actualizarData(false)}
            />
          </Space>
        </Col>
      </Row>
      <EstadoGeneral 
        ordenes={ordenesTecnico} 
        loading={loadingOrdenes}
        negocio={negocioSeleccionado}
      />
      <IndicadorTCFL
        ordenes={ordenesTecnico.filter((e) => e["estado actividad"] === estadosToa.COMPLETADO)}
        loading={loadingOrdenes}
        negocio={negocioSeleccionado}
      />
      <IndicadorProductividad
        ordenes={ordenesTecnico.filter((e) => e && e['estado actividad'] === estadosToa.COMPLETADO)}
        tecnicos={listaTecnicos.filter((e) => e && e.empleado && ["hfc","gpon"].includes(e.empleado.sub_tipo_negocio))}
        loadingTecnicos={loadingAsistencia}
        negocio={negocioSeleccionado}
        zona={zonaSeleccionada}
        cargarRutas={cargarAsistencias}
      />
      <IndicadorLiquidación
        ordenes={ordenesTecnico.filter((e) => e && e['estado actividad'] === estadosToa.COMPLETADO && e['bucket inicial'] !== 'BK_LITEYCA_CRITICOS_01' )}
      />
    </div>
  )
}
