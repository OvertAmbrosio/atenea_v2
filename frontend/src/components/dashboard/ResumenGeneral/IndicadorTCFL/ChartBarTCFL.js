import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Bar } from '@ant-design/charts';
import { orange } from '@ant-design/colors';
import { Col, Row } from 'antd';
//eslint-disable-next-line
import { TOrdenesToa } from '../../../../libraries/separarField';

import colores from '../../../../constants/colores';
import moment from 'moment';
import ModalDetalleTCFL from './ModalDetalleTCFL';
import cogoToast from 'cogo-toast';

const listaColores = [colores.success, colores.error];

/**
 * @param {object} props
 * @param {TOrdenesToa[]} props.data
 * @param {string} props.tipo 
 * @param {number} props.horas
 * @param {boolean} props.loading 
 * @returns 
 */
function ChartBarTCFL({data, tipo, horas, loading}) {
  const [dataTipo, setDataTipo] = useState([]);
  const [dataPlazo, setDataPlazo] = useState([]);
  const [dataVencidas, setDataVencidas] = useState([]);
  const [nombreTipo, setNombreTipo] = useState('');
  const [modalDetalle, setModalDetalle] = useState(false);

  useEffect(() => {
    generarData();
  //eslint-disable-next-line
  }, [data]);

  function verDetalle(nombre, plazo, vencidas) {
    setNombreTipo(nombre);
    setDataPlazo(plazo);
    setDataVencidas(vencidas);
    abrirModalDetalle();
  };

  function generarData() {
    switch (tipo) {
      case 'bucket': return generarPorBucket();
      case 'contrata': return generarPorContrata();
      case 'gestor': return generarPorGestor();
      default: setDataTipo([]);
    }
  };

  const generarPorBucket = () => {
    const buckets = [];
    const nuevasOrdenes = [];
    data.forEach((orden) => {
      if (!buckets.includes(orden['bucket inicial'])) {
        buckets.push(orden['bucket inicial']);
      };
    });
    buckets.forEach((bucket) => {
      const plazo_ordenes = data.filter((e) => e['bucket inicial'] === bucket && moment(e.hora_de_pre_no_realizado_tecnico, 'YYYY-MM-DD HH:mm')
        .diff(moment(e['fecha de registro legados'], 'DD/MM/YY HH:mm A'), 'hour') < horas);
      const vencidas_ordenes = data.filter((e) => e['bucket inicial'] === bucket && moment(e.hora_de_pre_no_realizado_tecnico, 'YYYY-MM-DD HH:mm')
        .diff(moment(e['fecha de registro legados'], 'DD/MM/YY HH:mm A'), 'hour') >= horas);
      nuevasOrdenes.push({
        titulo: String(bucket.replace(/BK_|MA_|MR_|SM_|SV_|SJ_|PN_|VN_/g, "")).replace(/_|#|-|@|<>/g, " "),
        plazo: plazo_ordenes.length,
        plazo_ordenes,
        vencidas: vencidas_ordenes.length,
        vencidas_ordenes,
        tipo: "vencidas",
        porcentaje: Math.round((vencidas_ordenes.length*100)/(plazo_ordenes.length+vencidas_ordenes.length))
      }, {
        titulo: String(bucket.replace(/BK_|MA_|MR_|SM_|SV_|SJ_|PN_|VN_/g, "")).replace(/_|#|-|@|<>/g, " "),
        plazo: plazo_ordenes.length,
        plazo_ordenes,
        vencidas: vencidas_ordenes.length,
        vencidas_ordenes,
        tipo:"plazo",
        porcentaje: Math.round((plazo_ordenes.length*100)/(plazo_ordenes.length+vencidas_ordenes.length))
      })
    });
    setDataTipo(nuevasOrdenes.filter(e => e))
  };

  const generarPorContrata = () => {
    const contratas = [];
    const nuevasOrdenes = [];
    data.forEach((orden) => {
      if (orden.contrata && !contratas.includes(orden.contrata.nombre)) {
        contratas.push(orden.contrata.nombre);
      };
    });
    contratas.forEach((contrata) => {
      const plazo_ordenes = data.filter((e) => e.contrata && e.contrata.nombre === contrata && 
        moment(e.hora_de_pre_no_realizado_tecnico, 'YYYY-MM-DD HH:mm')
        .diff(moment(e['fecha de registro legados'], 'DD/MM/YY HH:mm A'), 'hour') < horas);
      const vencidas_ordenes = data.filter((e) => e.contrata && e.contrata.nombre === contrata && 
        moment(e.hora_de_pre_no_realizado_tecnico, 'YYYY-MM-DD HH:mm')
        .diff(moment(e['fecha de registro legados'], 'DD/MM/YY HH:mm A'), 'hour') >= horas);
      nuevasOrdenes.push({
        titulo: contrata,
        plazo: plazo_ordenes.length,
        plazo_ordenes,
        vencidas: vencidas_ordenes.length,
        vencidas_ordenes,
        tipo: 'vencidas',
        porcentaje: Math.round((vencidas_ordenes.length*100)/(plazo_ordenes.length+vencidas_ordenes.length))
      },{
        titulo: contrata,
        plazo: plazo_ordenes.length,
        plazo_ordenes,
        vencidas: vencidas_ordenes.length,
        vencidas_ordenes,
        tipo: 'plazo',
        porcentaje: Math.round((plazo_ordenes.length*100)/(plazo_ordenes.length+vencidas_ordenes.length))
      })
    });
    setDataTipo(nuevasOrdenes.filter(e => e))
  };

  const generarPorGestor = () => {
    const gestores = [];
    const nuevasOrdenes = [];
    data.forEach((orden) => {
      if (orden.gestor && !gestores.includes(orden.gestor.nombre)) {
        gestores.push(orden.gestor.nombre);
      };
    });
    gestores.forEach((gestor) => {
      const plazo_ordenes = data.filter((e) => e.gestor && e.gestor.nombre === gestor && 
        moment(e.hora_de_pre_no_realizado_tecnico, 'YYYY-MM-DD HH:mm')
        .diff(moment(e['fecha de registro legados'], 'DD/MM/YY HH:mm A'), 'hour') < horas);
      const vencidas_ordenes = data.filter((e) => e.gestor && e.gestor.nombre === gestor && 
        moment(e.hora_de_pre_no_realizado_tecnico, 'YYYY-MM-DD HH:mm')
        .diff(moment(e['fecha de registro legados'], 'DD/MM/YY HH:mm A'), 'hour') >= horas);
      nuevasOrdenes.push({
        titulo: gestor,
        plazo: plazo_ordenes.length,
        plazo_ordenes,
        vencidas: vencidas_ordenes.length,
        vencidas_ordenes,
        tipo:"vencidas",
        porcentaje: Math.round((vencidas_ordenes.length*100)/(plazo_ordenes.length+vencidas_ordenes.length))
      },{
        titulo: gestor,
        plazo: plazo_ordenes.length,
        plazo_ordenes,
        vencidas: vencidas_ordenes.length,
        vencidas_ordenes,
        tipo:"plazo",
        porcentaje: Math.round((plazo_ordenes.length*100)/(plazo_ordenes.length+vencidas_ordenes.length))
      })
    });
    setDataTipo(nuevasOrdenes.filter(e => e))
  };

  const abrirModalDetalle = () => setModalDetalle(!modalDetalle);

  return (
    <div>
      <Bar
        onReady={(plot) => {
          plot.on('element:click', ({data}) => {
            if (data && data.data && data.data.plazo_ordenes) {
              return verDetalle(data.data.titulo, data.data.plazo_ordenes, data.data.vencidas_ordenes);
            } else {
              return cogoToast.warn("No se encontraron ordenes", { position: 'top-right' });
            };
          });
        }}
        height={320}
        data={dataTipo}
        loading={loading}
        appendPadding={1}
        isStack={true}
        xField='porcentaje'
        yField="titulo"
        seriesField="tipo"
        color={(data) => data.tipo === "plazo" ? "#C9D9FF" : "#FAEDEA"}
        xAxis={{
          max: 100
        }}
        label={{
          animate: true,
          autoRotate: false,
          position: "top",
          callback: (a,b) => {
            if (a < 60) {
              return {
                content: ({tipo}) => tipo === 'plazo' ? a+'%' : '',
                style:{
                  fill: '#D73902',
                  opacity: 1,
                  fontSize: 16,
                  fontWeight: 500,
                  textAlign: 'center',
                  textBaseline: 'middle',
                  shadowColor: '#900C3F',
                  shadowBlur: 1.4,
                  shadowOffsetX: 0.8,
                  shadowOffsetY: -0.2,
                },
              }
            } else if (a >= 60 && a < 90) {
              return {
                content: ({tipo}) => tipo === 'plazo' ? a+'%' : '',
                style:{
                  fill: orange.primary,
                  opacity: 1,
                  fontSize: 16,
                  fontWeight: 500,
                  textAlign: 'center',
                  textBaseline: 'middle',
                  shadowColor: orange[4],
                  shadowBlur: 1.4,
                  shadowOffsetX: 0.8,
                  shadowOffsetY: -0.2,
                },
              }
            } else {
              return {
                content: ({tipo}) => tipo === 'plazo' ? a+'%' : '',
                style:{
                  fill: '#19E347',
                  opacity: 1,
                  fontSize: 17,
                  fontWeight: 500,
                  textAlign: 'center',
                  textBaseline: 'middle',
                  shadowColor: '#007C1C',
                  shadowBlur: 1.2,
                  shadowOffsetX: .2,
                  shadowOffsetY: -.15,
                },
              }
            }
          },
        }}
        annotations={[
          {
            type: 'line',
            start: ['min', '95'],
            end: ['max', '95'],
            text: {
              content: "Meta",
              style: { textAlign: 'end', fill: colores.success },
              rotate: .8
            },
            style: {
              lineDash: [4, 8],
              stroke: '#009730',
              opacity: 1,
              lineWidth: 2.7
            },
          },
        ]}
        tooltip={{
          fields:["plazo","vencidas"],
          marker: {
            fill: "#DAF7A6"                  
          },
          customContent: (title, items) => {
            return (
              <>
                <h4 style={{ marginTop: '.6rem' }}>{title}</h4>
                <ul style={{ paddingLeft: 0 }}>
                  {items?.map((item, index) => {
                    const { name, value } = item;
                    if (index < 2) {
                      return (
                        <li
                          key={index}
                          className="g2-tooltip-list-item"
                          data-index={index}
                          style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}
                        >
                          <span className="g2-tooltip-marker" style={{ backgroundColor: listaColores[index] }}></span>
                          <Row justify="space-between" style={{width: '5rem'}}>
                            <Col>
                              <span style={{ margiRight: '.5rem' }}>{`${name}: `}</span>
                            </Col>
                            <Col>
                              <span className="g2-tooltip-list-item-value">{value}</span>
                            </Col>
                          </Row>
                        </li>
                      );
                    } else { return null}
                  })}
                </ul>
              </>
            );
          },
        }}
        barWidthRatio={.4}
      />
      {/* MODAL DEL DETALLE */}
      <ModalDetalleTCFL
        visible={modalDetalle}
        abrir={abrirModalDetalle}
        nombre={nombreTipo}
        plazo={dataPlazo}
        vencidas={dataVencidas}
        hora={horas}
      />
    </div>
  )
};

ChartBarTCFL.propTypes = {
  data: PropTypes.array,
  tipo: PropTypes.string,
  loading: PropTypes.bool
};

export default ChartBarTCFL;

